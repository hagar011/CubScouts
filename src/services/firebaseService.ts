/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { db, auth } from '../lib/firebase';
import {
  collection,
  doc,
  query,
  where,
  orderBy,
  limit,
  startAfter,
  getDocs,
  DocumentSnapshot,
  onSnapshot,
  Query,
  QuerySnapshot,
  collectionGroup
} from 'firebase/firestore';
import { isLeaderEmail } from '../utils/scoutHelpers';

export enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

export interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId?: string | null;
    email?: string | null;
    emailVerified?: boolean | null;
    isAnonymous?: boolean | null;
    tenantId?: string | null;
    providerInfo?: {
      providerId?: string | null;
      email?: string | null;
    }[];
  };
}

/**
 * Handles Firestore errors by wrapping them into a standard compliant format.
 */
export function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null): never {
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: auth.currentUser?.uid,
      email: auth.currentUser?.email,
      emailVerified: auth.currentUser?.emailVerified,
      isAnonymous: auth.currentUser?.isAnonymous,
      tenantId: auth.currentUser?.tenantId,
      providerInfo: auth.currentUser?.providerData?.map(provider => ({
        providerId: provider.providerId,
        email: provider.email,
      })) || []
    },
    operationType,
    path
  };
  console.error('[DATABASE ERROR] Firestore operation failed: ', JSON.stringify(errInfo));
  throw new Error(JSON.stringify(errInfo));
}

// ==========================================
// 1. OPTIMIZED REAL-TIME LISTENERS & QUERIES
// ==========================================

/**
 * أخطاء الاشتراكات اللحظية (مثل permission-denied): نسجّلها ونرجّع قائمة فارغة.
 * الرمي داخل callback الخطأ لا يلتقطه أحد ويوقف الاشتراك.
 */
function reportListenerError(
  error: unknown,
  path: string,
  callback: (data: any[]) => void,
  errorCallback?: (error: any) => void
) {
  const code = (error as { code?: string })?.code || 'unknown';
  console.error(`[Firestore] listener on "${path}" failed (${code})`);
  callback([]);
  if (errorCallback) errorCallback(error);
}

/**
 * Subscribes to pending points with targeted, role-based queries.
 * Non-leaders ONLY listen to their own points. Leaders listen to active ones.
 * This heavily reduces read operations and safeguards privacy!
 */
export function subscribeToPendingPoints(
  role: string | null,
  uid: string | null,
  callback: (data: any[]) => void,
  errorCallback?: (error: any) => void
) {
  if (!uid) {
    callback([]);
    return () => {};
  }

  const colRef = collection(db, 'pendingPoints');
  let q: Query;

  if (role === 'leader' || isLeaderEmail(auth.currentUser?.email)) {
    // Leaders need to see active pending points (limit 150 for safety)
    q = query(colRef, orderBy('createdAt', 'desc'), limit(150));
  } else if (role === 'parent') {
    // ولي الأمر يرى الطلبات التي أرسلها هو فقط
    q = query(colRef, where('parentUid', '==', uid), limit(50));
  } else {
    // الشبل يرى طلباته هو فقط
    q = query(colRef, where('cubId', '==', uid), limit(50));
  }

  return onSnapshot(
    q,
    (snapshot) => {
      const data = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
      callback(data);
    },
    (error) => reportListenerError(error, 'pendingPoints', callback, errorCallback)
  );
}

/**
 * Subscribes to global tasks with high-performance optimized ordering & limits.
 */
export function subscribeToGlobalTasks(
  callback: (data: any[]) => void,
  errorCallback?: (error: any) => void
) {
  const q = query(collection(db, 'globalTasks'), orderBy('createdAt', 'desc'), limit(50));
  return onSnapshot(
    q,
    (snapshot) => {
      const data = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
      callback(data);
    },
    (error) => reportListenerError(error, 'globalTasks', callback, errorCallback)
  );
}

/**
 * Subscribes to cubs collection. Non-leaders should NOT listen to everyone!
 */
export function subscribeToCubs(
  role: string | null,
  uid: string | null,
  callback: (data: any[]) => void,
  limitCount: number = 100,
  errorCallback?: (error: any) => void
) {
    if (!uid) {
    callback([]);
    return () => {};
  }

  const isLeader = role === 'leader' || isLeaderEmail(auth.currentUser?.email);

  let q: Query;

  if (isLeader) {
    q = query(collection(db, 'cubs'), limit(limitCount));
  } else if (role === 'cub') {
    // الشبل يقرأ ملفه فقط (قواعد الحماية تسمح بقراءة المستند الخاص به)
    return onSnapshot(
      doc(db, 'cubs', uid),
      (snap) => callback(snap.exists() ? [{ ...snap.data(), id: snap.id }] : []),
      (error) => reportListenerError(error, 'cubs', callback, errorCallback)
    );
  } else {
    callback([]);
    return () => {};
  }

  return onSnapshot(
    q,
    (snapshot) => {
      const data = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
      callback(data);
    },
    (error) => reportListenerError(error, 'cubs', callback, errorCallback)
  );
}
        
 /**
 * Subscribes to safety reports. Strictly restricted to leaders only.
 * Normal users don't listen, avoiding useless permission denied errors.
 */
export function subscribeToSafetyReports(
  role: string | null,
  callback: (data: any[]) => void,
  limitCount: number = 6,
  errorCallback?: (error: any) => void
) {
  const isLeader = role === 'leader' || isLeaderEmail(auth.currentUser?.email);
  if (!isLeader) {
    callback([]);
    return () => {};
  }

  const q = query(collection(db, 'safety_reports'), orderBy('timestamp', 'desc'), limit(limitCount));
  return onSnapshot(
    q,
    (snapshot) => {
      const data = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
      callback(data);
    },
    (error) => reportListenerError(error, 'safety_reports', callback, errorCallback)
  );
}

// ==========================================
// 2. HIGH PERFORMANCE PAGINATION CLIENT API
// ==========================================

export interface PaginatedResult<T> {
  data: T[];
  lastVisible: DocumentSnapshot | null;
  hasMore: boolean;
}

/**
 * Generic high-performance paginator.
 */
export async function fetchPaginatedCollection<T = any>(
  collectionName: string,
  orderByField: string,
  direction: 'asc' | 'desc',
  pageSize: number,
  lastVisibleDoc: DocumentSnapshot | null = null,
  filters: { field: string; op: any; value: any }[] = []
): Promise<PaginatedResult<T>> {
  try {
    const colRef = collection(db, collectionName);
    let queryConstraints: any[] = filters.map(f => where(f.field, f.op, f.value));
    
    queryConstraints.push(orderBy(orderByField, direction));
    queryConstraints.push(limit(pageSize));

    if (lastVisibleDoc) {
      queryConstraints.push(startAfter(lastVisibleDoc));
    }

    const q = query(colRef, ...queryConstraints);
    const snapshot = await getDocs(q);

    const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as any)) as T[];
    const lastVisible = snapshot.docs.length > 0 ? snapshot.docs[snapshot.docs.length - 1] : null;
    const hasMore = snapshot.docs.length === pageSize;

    return {
      data,
      lastVisible,
      hasMore
    };
  } catch (error) {
    handleFirestoreError(error, OperationType.LIST, collectionName);
  }
}

/**
 * Helper to paginate archived / historical pending points.
 */
export async function fetchPaginatedPendingPoints(
  pageSize: number,
  lastVisible: DocumentSnapshot | null = null,
  filterCubId?: string
): Promise<PaginatedResult<any>> {
  const filters: any[] = [];
  if (filterCubId) {
    filters.push({ field: 'cubId', op: '==', value: filterCubId });
  }
  return fetchPaginatedCollection('pendingPoints', 'createdAt', 'desc', pageSize, lastVisible, filters);
}

/**
 * Helper to paginate safety reports.
 */
export async function fetchPaginatedSafetyReports(
  pageSize: number,
  lastVisible: DocumentSnapshot | null = null
): Promise<PaginatedResult<any>> {
  return fetchPaginatedCollection('safety_reports', 'timestamp', 'desc', pageSize, lastVisible);
}

/**
 * Helper to paginate meetings.
 */
export async function fetchPaginatedMeetings(
  pageSize: number,
  lastVisible: DocumentSnapshot | null = null
): Promise<PaginatedResult<any>> {
  return fetchPaginatedCollection('meetings', 'date', 'desc', pageSize, lastVisible);
}
