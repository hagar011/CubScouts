/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 *
 * نظام ربط الأشبال بأولياء الأمور.
 *
 * الفكرة:
 *  - لا أحد يبحث عن شبل ولا يكتب UID. كل ربط يبدأ بكود مؤقت يصدره الشبل أو القائد.
 *  - العلاقة تُحفظ في مجموعة منفصلة: parentCubRelationships (معرّف المستند: parentUid_cubUid).
 *  - ولي الأمر الواحد يمكن أن يرتبط بعدة أشبال، والشبل بعدة أولياء أمور.
 *  - التحقق الحقيقي في firestore.rules، وهذا الملف يبني الطلبات بالشكل الذي تقبله القواعد.
 */

import { db } from '../lib/firebase';
import {
  collection, doc, getDoc, getDocs, setDoc, updateDoc, deleteDoc, writeBatch,
  onSnapshot, query, where, limit, serverTimestamp, Timestamp,
  DocumentData, QueryDocumentSnapshot,
} from 'firebase/firestore';
import type { LinkCode, ParentCubRelationship, RelationshipType } from '../types';

// ─── ثوابت ────────────────────────────────────────────────────────────────────

/** صلاحية كود الربط (القواعد تسمح بحد أقصى 45 دقيقة لتحمّل فرق ساعة الجهاز) */
export const LINK_CODE_TTL_MS = 15 * 60 * 1000;
/** مهلة انتظار موافقة الشبل/القائد على طلب الربط */
export const REQUEST_TTL_MS = 7 * 24 * 60 * 60 * 1000;

// أحرف بلا أشكال متشابهة (بدون 0/O و1/I/L) لتسهيل القراءة والكتابة
const ALPHABET = 'ABCDEFGHJKMNPQRSTUVWXYZ23456789';

export const RELATIONSHIP_LABELS: Record<RelationshipType, string> = {
  father: 'الأب',
  mother: 'الأم',
  guardian: 'وصي / ولي أمر',
};

export const LOOKUP_ERRORS = {
  invalid_format: 'الكود غير مكتمل. اكتب الكود كما يظهر لك، مثل: CUB-AB12-CD34',
  not_found: 'هذا الكود غير صحيح. تأكد منه أو اطلب كوداً جديداً.',
  used: 'تم استخدام هذا الكود من قبل. اطلب كوداً جديداً.',
  expired: 'انتهت صلاحية هذا الكود. اطلب كوداً جديداً.',
  revoked: 'تم إلغاء هذا الكود. اطلب كوداً جديداً.',
  error: 'تعذّر التحقق من الكود الآن. حاول مرة أخرى.',
} as const;

export type LookupFailure = keyof typeof LOOKUP_ERRORS;

// ملاحظة: بنية مسطّحة (وليست union) لأن tsconfig المشروع فيه strict:false
// وفي هذا الوضع لا يعمل تضييق النوع بحسب ok.
export interface LookupResult {
  ok: boolean;
  code?: LinkCode;
  reason?: LookupFailure;
}

// ─── أدوات مساعدة ─────────────────────────────────────────────────────────────

/** يحوّل Timestamp أو نصاً أو null إلى ميلّي ثانية (0 إن لم يوجد) */
export function tsMillis(value: unknown): number {
  if (!value) return 0;
  const t = value as { toMillis?: () => number };
  if (typeof t.toMillis === 'function') return t.toMillis();
  if (typeof value === 'string') return Date.parse(value) || 0;
  return 0;
}

export function isCodeExpired(code: Pick<LinkCode, 'expiresAt'>, now = Date.now()): boolean {
  return tsMillis(code.expiresAt) <= now;
}

/** طلب الربط المعلّق يُعتبر "منتهياً" بعد مهلته (لا نخزّن هذه الحالة، نحسبها) */
export function isRequestExpired(rel: Pick<ParentCubRelationship, 'status' | 'expiresAt'>, now = Date.now()): boolean {
  return rel.status === 'pending' && !!rel.expiresAt && tsMillis(rel.expiresAt) <= now;
}

export function relationshipId(parentUid: string, cubUid: string): string {
  return `${parentUid}_${cubUid}`;
}

/** كود عشوائي آمن بصيغة CUB-XXXX-XXXX (أكثر من 39 بت من العشوائية) */
export function generateLinkCode(): string {
  const bytes = new Uint8Array(8);
  crypto.getRandomValues(bytes);
  const chars = Array.from(bytes, (b) => ALPHABET[b % ALPHABET.length]);
  return `CUB-${chars.slice(0, 4).join('')}-${chars.slice(4).join('')}`;
}

/** يقبل الكود بأي شكل (حروف صغيرة، مسافات، بدون CUB) ويرجّعه بالصيغة القياسية أو null */
export function normalizeLinkCode(raw: string): string | null {
  let body = raw.toUpperCase().replace(/[^A-Z0-9]/g, '');
  if (body.length === 11 && body.startsWith('CUB')) body = body.slice(3);
  if (body.length !== 8) return null;
  return `CUB-${body.slice(0, 4)}-${body.slice(4)}`;
}

function mapRelationship(d: QueryDocumentSnapshot<DocumentData>): ParentCubRelationship {
  return { ...(d.data() as Omit<ParentCubRelationship, 'id'>), id: d.id };
}

function mapCode(d: QueryDocumentSnapshot<DocumentData>): LinkCode {
  return { ...(d.data() as LinkCode), code: d.id };
}

// ─── أكواد الربط ──────────────────────────────────────────────────────────────

/**
 * ينشئ كود ربط جديداً. يستخدمه الشبل (لنفسه) أو القائد (لأي شبل، ومنهم من ليس له حساب).
 * requiresApproval=true: يتحول استخدام الكود إلى طلب "معلّق" ينتظر موافقة الشبل/القائد.
 */
export async function createLinkCode(params: {
  cubUid: string;
  cubName: string;
  cubAvatar?: string;
  createdBy: string;
  requiresApproval: boolean;
}): Promise<string> {
  let lastError: unknown;
  for (let attempt = 0; attempt < 3; attempt++) {
    const code = generateLinkCode();
    try {
      await setDoc(doc(db, 'linkCodes', code), {
        code,
        cubUid: params.cubUid,
        cubName: params.cubName,
        cubAvatar: params.cubAvatar || '',
        status: 'active',
        createdBy: params.createdBy,
        createdAt: serverTimestamp(),
        expiresAt: Timestamp.fromMillis(Date.now() + LINK_CODE_TTL_MS),
        requiresApproval: params.requiresApproval,
      });
      return code;
    } catch (err) {
      lastError = err; // احتمال نادر لتكرار الكود: نعيد المحاولة بكود جديد
    }
  }
  throw lastError;
}

export async function revokeLinkCode(code: string): Promise<void> {
  await updateDoc(doc(db, 'linkCodes', code), { status: 'revoked' });
}

/** الأكواد النشطة التي أنشأها هذا المستخدم (الشبل لنفسه أو القائد لأشباله) */
export function subscribeToMyActiveCodes(
  createdBy: string,
  callback: (codes: LinkCode[]) => void
) {
  const q = query(
    collection(db, 'linkCodes'),
    where('createdBy', '==', createdBy),
    where('status', '==', 'active'),
    limit(100)
  );
  return onSnapshot(
    q,
    (snap) => callback(snap.docs.map(mapCode)),
    (err) => {
      console.error('[linkCodes] listener failed', (err as { code?: string }).code);
      callback([]);
    }
  );
}

/** ولي الأمر يدخل الكود: نتحقق منه ونعرض بيانات تعريفية محدودة فقط (اسم الشبل وصورته) */
export async function lookupLinkCode(raw: string): Promise<LookupResult> {
  const code = normalizeLinkCode(raw);
  if (!code) return { ok: false, reason: 'invalid_format' };
  try {
    const snap = await getDoc(doc(db, 'linkCodes', code));
    if (!snap.exists()) return { ok: false, reason: 'not_found' };
    const data = { ...(snap.data() as LinkCode), code };
    if (data.status === 'used') return { ok: false, reason: 'used' };
    if (data.status === 'revoked') return { ok: false, reason: 'revoked' };
    if (isCodeExpired(data)) return { ok: false, reason: 'expired' };
    return { ok: true, code: data };
  } catch (err) {
    console.error('[linkCodes] lookup failed', err);
    return { ok: false, reason: 'error' };
  }
}

/**
 * ولي الأمر يؤكد الربط. عملية واحدة ذرية (batch): نستهلك الكود وننشئ العلاقة معاً.
 * قواعد Firestore ترفض أي من الخطوتين إن لم تتم الأخرى في نفس العملية.
 */
export async function redeemLinkCode(params: {
  code: LinkCode;
  parentUid: string;
  parentName: string;
  relationship: RelationshipType;
}): Promise<'approved' | 'pending'> {
  const { code, parentUid, parentName, relationship } = params;
  const status = code.requiresApproval ? 'pending' : 'approved';

  const rel: Record<string, unknown> = {
    parentUid,
    cubUid: code.cubUid,
    relationship,
    status,
    createdBy: parentUid,
    createdAt: serverTimestamp(),
    viaCode: code.code,
    parentName,
    cubName: code.cubName,
    cubAvatar: code.cubAvatar || '',
  };
  if (status === 'approved') {
    rel.approvedAt = serverTimestamp();
    rel.approvedBy = code.createdBy;
  } else {
    rel.expiresAt = Timestamp.fromMillis(Date.now() + REQUEST_TTL_MS);
  }

  const batch = writeBatch(db);
  batch.update(doc(db, 'linkCodes', code.code), {
    status: 'used',
    usedBy: parentUid,
    usedAt: serverTimestamp(),
  });
  batch.set(doc(db, 'parentCubRelationships', relationshipId(parentUid, code.cubUid)), rel);
  await batch.commit();
  return status;
}

// ─── العلاقات ─────────────────────────────────────────────────────────────────

/** قبول أو رفض طلب معلّق (الشبل صاحب الطلب أو القائد) */
export async function respondToRelationship(
  relId: string,
  decision: 'approved' | 'rejected',
  responderUid: string
): Promise<void> {
  const data =
    decision === 'approved'
      ? { status: 'approved', approvedAt: serverTimestamp(), approvedBy: responderUid }
      : { status: 'rejected', rejectedAt: serverTimestamp() };
  await updateDoc(doc(db, 'parentCubRelationships', relId), data);
}

/** إزالة العلاقة (ولي الأمر أو الشبل أو القائد) */
export async function removeRelationship(relId: string): Promise<void> {
  await deleteDoc(doc(db, 'parentCubRelationships', relId));
}

/** للقائد عند حذف شبل: ينظف علاقاته حتى لا تبقى معلّقة */
export async function deleteRelationshipsForCub(cubUid: string): Promise<void> {
  const snap = await getDocs(
    query(collection(db, 'parentCubRelationships'), where('cubUid', '==', cubUid), limit(200))
  );
  if (snap.empty) return;
  const batch = writeBatch(db);
  snap.docs.forEach((d) => batch.delete(d.ref));
  await batch.commit();
}

function subscribeRelationships(
  q: ReturnType<typeof query>,
  label: string,
  callback: (rels: ParentCubRelationship[]) => void
) {
  return onSnapshot(
    q,
    (snap) => callback(snap.docs.map(mapRelationship)),
    (err) => {
      console.error(`[relationships:${label}] listener failed`, (err as { code?: string }).code);
      callback([]);
    }
  );
}

/** أبناء ولي الأمر (وطلباته) */
export function subscribeToParentRelationships(
  parentUid: string,
  callback: (rels: ParentCubRelationship[]) => void
) {
  return subscribeRelationships(
    query(collection(db, 'parentCubRelationships'), where('parentUid', '==', parentUid), limit(50)),
    'parent',
    callback
  );
}

/** أولياء أمور الشبل (وطلبات الربط الموجهة له) */
export function subscribeToCubRelationships(
  cubUid: string,
  callback: (rels: ParentCubRelationship[]) => void
) {
  return subscribeRelationships(
    query(collection(db, 'parentCubRelationships'), where('cubUid', '==', cubUid), limit(50)),
    'cub',
    callback
  );
}

/** للقائد: كل العلاقات */
export function subscribeToAllRelationships(callback: (rels: ParentCubRelationship[]) => void) {
  return subscribeRelationships(
    query(collection(db, 'parentCubRelationships'), limit(500)),
    'all',
    callback
  );
}
