/* *
 * @license SPDX-License-Identifier: Apache-2.0
 * 
 * منصة الأشبال الذكية ⚜️
 * كود محسن، مقسم إلى مكونات معيارية، خالٍ من التكرار والكود الميت.
 */

import React, {
  useState, useEffect, useMemo, useCallback,
  Suspense, lazy, createContext, useContext,
} from 'react';
import {
  Users, Gamepad2, Trophy, Map as MapIcon,
  Compass, Tent, Star, Calendar, Trash2,
  Lock, Settings, Sun, Moon,
  MessageSquare, Sparkles, LogOut, CheckCircle, ShieldCheck
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

// ─── Internal Types & Constants ───────────────────────────────────────────────
import {
  Cub, CubLevel, EvaluationCriteria, ConductCriteria,
  Meeting, UserRole, Sextet, WeeklyMeetingEvaluation, MonthlyReport,
  NotificationItem, GlobalTask, PendingPointRequest, Leader, LeaderBadge,
 ParentCubRelationship,
} from './types';
import { AVAILABLE_BADGES, Badge } from './badges';
import { SEXTETS } from './constants/initialData';
import { ZERO_CONDUCT, ZERO_EVALUATION, MOBTADI_REQUIREMENTS } from './constants/initialData';
import { LEADERSHIP_BADGES, INITIAL_LEADERS, AVATARS } from './constants/scoutData';

// ─── Firebase ─────────────────────────────────────────────────────────────────
import {
  collection, doc, setDoc, updateDoc, deleteDoc,
  onSnapshot, query, where, limit, getDocs, writeBatch, getDoc,
} from 'firebase/firestore';
import { db, auth } from './lib/firebase';
import {
  onAuthStateChanged, signOut, signInWithEmailAndPassword,
  createUserWithEmailAndPassword, updateProfile, User as FirebaseUser,
} from 'firebase/auth';

// ─── Utils ────────────────────────────────────────────────────────────────────
import { isLeaderEmail, sanitizeForFirestore } from './utils/security';
import { ToastProvider, useToast } from './utils/toast';
import { atomicAddPoints, atomicAddGamePoints, atomicUpdateSextetPoints } from './utils/firestoreHelpers';
import {
  subscribeToPendingPoints, subscribeToGlobalTasks,
  subscribeToSafetyReports, subscribeToCubs,
} from './services/firebaseService';

// ─── Modular Components & Modals ──────────────────────────────────────────────
import { subscribeToParentRelationships, deleteRelationshipsForCub } from './services/linkService';
import LinkCubModal from './components/linking/LinkCubModal';
import CubLinkRequestsBanner from './components/linking/CubLinkRequestsBanner';
import AuthScreen from './components/auth/AuthScreen';
import ProfileSetupModal from './components/auth/ProfileSetupModal';
import RoleSelector from './components/auth/RoleSelector';
import AddCubModal from './components/modals/AddCubModal';
import AddLeaderModal from './components/modals/AddLeaderModal';
import NotificationCenterModal from './components/modals/NotificationCenterModal';
import ProfileEditModal from './components/modals/ProfileEditModal';
import DeleteConfirmModal from './components/modals/DeleteConfirmModal';
import BadgeCelebrationModal from './components/modals/BadgeCelebrationModal';

// ─── Lazy-Loaded Tabs (Optimized Bundle Splitting) ────────────────────────────
const DashboardTab = lazy(() => import('./components/tabs/DashboardTab'));
const EvaluateTab = lazy(() => import('./components/tabs/EvaluateTab'));
const ActivitiesTab = lazy(() => import('./components/tabs/ActivitiesTab'));
const BadgesTab = lazy(() => import('./components/tabs/BadgesTab'));
const LeaderboardTab = lazy(() => import('./components/tabs/LeaderboardTab'));
const LawTab = lazy(() => import('./components/tabs/LawTab'));
const MeetingsTab = lazy(() => import('./components/tabs/MeetingsTab'));
const SafeFromHarmTab = lazy(() => import('./components/tabs/SafeFromHarmTab'));
const SdgHeroesTab = React.lazy(() => import('./components/tabs/SdgHeroesTab'));
const TreasureAdventureMap = lazy(() => import('./components/TreasureAdventureMap'));
const MonthlyReportModal = lazy(() =>
  import('./components/MonthlyReportModal').then((m) => ({ default: m.MonthlyReportModal }))
);

// ─── Auth Context ─────────────────────────────────────────────────────────────
export const AuthContext = createContext<{
  currentUser: FirebaseUser | null;
  userProfile: Record<string, unknown> | null;
  role: UserRole | null;
  activeCub: Cub | null;
  authLoading: boolean;
} | null>(null);

export const useAuth = () => useContext(AuthContext);

// ─── Loading Component ────────────────────────────────────────────────────────
function TabLoadingSpinner() {
  return (
    <div className="flex flex-col items-center justify-center p-16 space-y-4 text-center">
      <Compass size={48} className="text-scout-yellow animate-spin" style={{ animationDuration: '2.5s' }} />
      <p className="text-sm font-black text-slate-500 dark:text-slate-400">جاري تجهيز الواجهة الكشفية... ⚜️</p>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Inner App Component
// ─────────────────────────────────────────────────────────────────────────────
function AppInner() {
  const { showToast, showConfirm } = useToast();

  // ── Auth State ──────────────────────────────────────────────────────────────
  const [currentUser,       setCurrentUser]       = useState<FirebaseUser | null>(null);
  const [userProfile,       setUserProfile]       = useState<Record<string, unknown> | null>(null);
  const [role,              setRole]              = useState<UserRole | null>(null);
  const [activeCubId,       setActiveCubId]       = useState<string | null>(null);
  const [activeCub,         setActiveCub]         = useState<Cub | null>(null);
  const [setupRequired,     setSetupRequired]     = useState(false);
  const [authLoading,       setAuthLoading]       = useState(true);
  const [authError,         setAuthError]         = useState('');
  const [submittingSetup,    setSubmittingSetup]    = useState(false);

  // ── App Data ────────────────────────────────────────────────────────────────
  const [cubs,          setCubs]          = useState<Cub[]>([]);
  const [sextets,       setSextets]       = useState<Sextet[]>([]);
  const [meetings,      setMeetings]      = useState<Meeting[]>([]);
  const [leaders,       setLeaders]       = useState<Leader[]>([]);
  const [attendance,    setAttendance]    = useState<Record<string, boolean>>({});
  const [gamesLocked,   setGamesLocked]   = useState(false);
  const [currentWeek,   setCurrentWeek]   = useState(1);
  const [pendingPoints, setPendingPoints] = useState<PendingPointRequest[]>([]);
  const [globalTasks,   setGlobalTasks]   = useState<GlobalTask[]>([]);
  const [safetyReports, setSafetyReports] = useState<Record<string, unknown>[]>([]);
  const [safetyReportsLimit] = useState(6);
  // ولي الأمر: علاقاته والأشبال المرتبطون به
  const [parentRelationships, setParentRelationships] = useState<ParentCubRelationship[]>([]);
  const [linkedCubsById, setLinkedCubsById] = useState<Record<string, Cub>>({});
  const [showLinkModal, setShowLinkModal] = useState<false | 'intro' | 'code'>(false);

  // ── UI State ────────────────────────────────────────────────────────────────
  const [view, setView] = useState<
    'dashboard' | 'evaluate' | 'game' | 'progress' | 'law' | 'badges' | 'meetings' | 'safeFromHarm' | 'leaderboard' | 'sdgHeroes' | 'activities'
  >('dashboard');

  const [isDarkMode, setIsDarkMode] = useState(() => {
    try { return localStorage.getItem('theme') === 'dark'; } catch { return false; }
  });

  const [showMap, setShowMap] = useState(false);
  const [showAddCubModal, setShowAddCubModal] = useState(false);
  const [showAddLeaderModal, setShowAddLeaderModal] = useState(false);
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [showNotificationCenter, setShowNotificationCenter] = useState(false);
  const [cubToDelete, setCubToDelete] = useState<string | null>(null);
  const [celebratingBadge, setCelebratingBadge] = useState<{ badge: Badge; cubName: string } | null>(null);
  const [selectedPreviewReport, setSelectedPreviewReport] = useState<{ cub: Cub; report: MonthlyReport } | null>(null);
  const [showParentSuccessModal, setShowParentSuccessModal] = useState<{ show: boolean; message: string } | null>(null);

  // ── URL & Theme Sync ────────────────────────────────────────────────────────
  useEffect(() => {
    if (window.location.pathname !== '/') {
      window.history.replaceState(null, '', '/');
    }
  }, []);

  useEffect(() => {
    try {
      document.documentElement.classList.toggle('dark', isDarkMode);
      localStorage.setItem('theme', isDarkMode ? 'dark' : 'light');
    } catch { /* ignore */ }
  }, [isDarkMode]);

  // ── Auth Listener (Single Source of Truth) ──────────────────────────────────
  useEffect(() => {
    const fallback = setTimeout(() => {
      setAuthLoading(false);
    }, 4000);

    let unsubProfile: (() => void) | null = null;

    const unsubAuth = onAuthStateChanged(auth, async (user) => {
      if (unsubProfile) { unsubProfile(); unsubProfile = null; }

      if (!user) {
        clearTimeout(fallback);
        setCurrentUser(null);
        setUserProfile(null);
        setRole(null);
        setActiveCubId(null);
        setActiveCub(null);
        setSetupRequired(false);
        setAuthLoading(false);
        return;
      }

      setCurrentUser(user);

      // Leader fast-path
      if (isLeaderEmail(user.email)) {
        const leaderProfile = {
          uid: user.uid,
          email: user.email,
          displayName: user.displayName || 'قائد',
          photoURL: user.photoURL || '⚓',
          role: UserRole.LEADER,
          approved: true,
          createdAt: new Date().toISOString(),
        };

        try {
          await setDoc(doc(db, 'users', user.uid), leaderProfile, { merge: true });
        } catch (err) {
          console.error("Leader setDoc auto-create failed", err);
        }

        setUserProfile(leaderProfile);
        clearTimeout(fallback);
        setRole(UserRole.LEADER);
        setSetupRequired(false);
        setAuthLoading(false);
        return;
      }

      // Profile doc snapshot
      unsubProfile = onSnapshot(doc(db, 'users', user.uid), async (snap) => {
        try {
          if (!snap.exists()) {
            const newDoc = {
              uid: user.uid,
              email: user.email,
              displayName: user.displayName || 'مغامر جديد',
              photoURL: user.photoURL || '🦁',
              role: UserRole.CUB,
              approved: true,
              createdAt: new Date().toISOString(),
            };
            await setDoc(doc(db, 'users', user.uid), newDoc, { merge: true });
            setSetupRequired(true);
            clearTimeout(fallback);
            setAuthLoading(false);
            return;
          }

          const data = snap.data() as Record<string, unknown>;
          setUserProfile(data);

          const r = data.role as UserRole | undefined;

          if (r === UserRole.LEADER) {
            setRole(UserRole.LEADER);
            setSetupRequired(false);
            clearTimeout(fallback);
            setAuthLoading(false);
            return;
          }

          if (r === UserRole.CUB || r === ('cub' as UserRole) || r === ('scout' as UserRole)) {
            const cubSnap = await getDoc(doc(db, 'cubs', user.uid)).catch(() => null);
            if (cubSnap?.exists()) {
              setActiveCub(cubSnap.data() as Cub);
              setActiveCubId(user.uid);
            }
            setRole(UserRole.CUB);
            setSetupRequired(false);
            clearTimeout(fallback);
            setAuthLoading(false);
            return;
          }

          if (r === UserRole.PARENT) {
            setRole(UserRole.PARENT);
            setSetupRequired(false);
            clearTimeout(fallback);
            setAuthLoading(false);
            return;
          }

          setSetupRequired(true);
          clearTimeout(fallback);
          setAuthLoading(false);
        } catch (err) {
          console.error("Error processing user snapshot", err);
          clearTimeout(fallback);
          setAuthLoading(false);
        }
      }, (error) => {
        console.error("User doc snapshot error", error);
        clearTimeout(fallback);
        setAuthLoading(false);
      });
    });

    return () => {
      unsubAuth();
      if (unsubProfile) unsubProfile();
      clearTimeout(fallback);
    };
  }, []);

  // Sync activeCub with cubs list
  useEffect(() => {
    if (role === UserRole.PARENT) return; // ولي الأمر يحمّل أبناءه من علاقاته المعتمدة
    if (!activeCubId) {
      setActiveCub(null);
      return;
    }
    const found = cubs.find((c) => c.id === activeCubId);
    if (found) {
      setActiveCub(found);
      return;
    }

    const loadCubDirectly = async () => {
      try {
        const snap = await getDoc(doc(db, 'cubs', activeCubId));
        if (snap.exists()) {
          setActiveCub({ id: snap.id, ...(snap.data() as Cub) } as Cub);
        }
      } catch (err) {
        console.error("Error loading active cub directly", err);
      }
    };
    loadCubDirectly();
  }, [activeCubId, cubs, role]);

  // ── Subscriptions ───────────────────────────────────────────────────────────
  useEffect(() => {
    if (!currentUser) { setCubs([]); return; }
    return subscribeToCubs(role, currentUser.uid, setCubs);
  }, [currentUser, role]);

  useEffect(() => {
    if (!currentUser) { setSextets([]); return; }
    return onSnapshot(collection(db, 'sextets'), (snap) => {
      const data = snap.docs.map((d) => d.data() as Sextet);
      if (data.length === 0) {
        const batch = writeBatch(db);
        SEXTETS.forEach((s) => batch.set(doc(db, 'sextets', s.id), s));
        batch.commit().catch(console.error);
      } else {
        setSextets(data);
      }
    });
  }, [currentUser]);

  useEffect(() => {
    if (!currentUser) { setMeetings([]); return; }
    return onSnapshot(collection(db, 'meetings'), (snap) => {
      setMeetings(snap.docs.map((d) => d.data() as Meeting).sort((a, b) => b.date.localeCompare(a.date)));
    });
  }, [currentUser]);

  useEffect(() => {
    if (!currentUser) { setLeaders([]); return; }
    return onSnapshot(collection(db, 'leaders'), (snap) => {
      const data = snap.docs.map((d) => d.data() as Leader);
      if (data.length === 0) {
        const batch = writeBatch(db);
        INITIAL_LEADERS.forEach((l) => batch.set(doc(db, 'leaders', l.id), l));
        batch.commit().catch(console.error);
      } else {
        setLeaders(data);
      }
    });
  }, [currentUser]);

  useEffect(() => {
    if (!currentUser) return;
    return onSnapshot(doc(db, 'settings', 'global'), (snap) => {
      if (snap.exists()) {
        const d = snap.data();
        if (d.gamesLocked !== undefined) setGamesLocked(d.gamesLocked);
        if (d.attendance   !== undefined) setAttendance(d.attendance);
        if (d.currentWeek  !== undefined) setCurrentWeek(d.currentWeek);
      } else {
        setDoc(doc(db, 'settings', 'global'), { gamesLocked: false, attendance: {}, currentWeek: 1 }).catch(console.error);
      }
    });
  }, [currentUser]);

  useEffect(() => {
    if (!currentUser) { setPendingPoints([]); return; }
    return subscribeToPendingPoints(role, currentUser.uid, setPendingPoints);
  }, [currentUser, role]);

  useEffect(() => {
    if (!currentUser) { setGlobalTasks([]); return; }
    return subscribeToGlobalTasks(setGlobalTasks);
  }, [currentUser]);

  useEffect(() => {
    if (!currentUser) { setSafetyReports([]); return; }
    return subscribeToSafetyReports(role, setSafetyReports, safetyReportsLimit);
  }, [currentUser, role, safetyReportsLimit]);

  // ── ولي الأمر: العلاقات المعتمدة ثم بيانات كل شبل مرتبط (لحظياً) ─────────────
  useEffect(() => {
    if (!currentUser || role !== UserRole.PARENT) {
      setParentRelationships([]);
      return;
    }
    return subscribeToParentRelationships(currentUser.uid, setParentRelationships);
  }, [currentUser, role]);

  const approvedChildIds = useMemo(
    () => parentRelationships.filter((r) => r.status === 'approved').map((r) => r.cubUid).sort().join(','),
    [parentRelationships]
  );

  useEffect(() => {
    if (role !== UserRole.PARENT) {
      setLinkedCubsById({});
      return;
    }
    const ids = approvedChildIds ? approvedChildIds.split(',') : [];
    setLinkedCubsById((prev) => Object.fromEntries(Object.entries(prev).filter(([id]) => ids.includes(id))));
    const unsubs = ids.map((id) =>
      onSnapshot(
        doc(db, 'cubs', id),
        (snap) => {
          setLinkedCubsById((prev) => {
            const next = { ...prev };
            if (snap.exists()) next[id] = { ...(snap.data() as Cub), id: snap.id };
            else delete next[id];
            return next;
          });
        },
        (err) => {
          console.error('linked cub listener failed', (err as { code?: string }).code);
          setLinkedCubsById((prev) => {
            const next = { ...prev };
            delete next[id];
            return next;
          });
        }
      )
    );
    return () => unsubs.forEach((u) => u());
  }, [role, approvedChildIds]);

  // اختيار الشبل الظاهر لولي الأمر (يُحفظ اختياره على هذا الجهاز فقط)
  useEffect(() => {
    if (role !== UserRole.PARENT) return;
    const ids = Object.keys(linkedCubsById);
    if (ids.length === 0) {
      if (activeCubId) setActiveCubId(null);
      setActiveCub(null);
      return;
    }
    let saved: string | null = null;
    try { saved = localStorage.getItem('parent_active_cub'); } catch { /* ignore */ }
    const current =
      activeCubId && linkedCubsById[activeCubId] ? activeCubId
      : saved && linkedCubsById[saved] ? saved
      : ids[0];
    if (current !== activeCubId) setActiveCubId(current);
    setActiveCub(linkedCubsById[current]);
  }, [role, linkedCubsById, activeCubId]);

  // ── Auth Handlers ───────────────────────────────────────────────────────────
  const handleLogout = useCallback(async () => {
    await signOut(auth);
    setRole(null);
    setActiveCubId(null);
    setActiveCub(null);
    setSetupRequired(false);
  }, []);

  const handleSelectRole = useCallback(async (selectedRole: UserRole | null) => {
    if (selectedRole === UserRole.LEADER && currentUser) {
      if (!isLeaderEmail(currentUser.email)) {
        showToast('هذا الحساب ليس مسجلاً كقائد معتمد.', 'error');
        return;
      }
    }
    setRole(selectedRole);
    if (currentUser) {
      await setDoc(doc(db, 'users', currentUser.uid), {
        role: selectedRole || '',
        uid: currentUser.uid,
        email: currentUser.email,
        updatedAt: new Date().toISOString()
      }, { merge: true }).catch(console.error);
    }
  }, [currentUser, showToast]);

  const handleSelectCub = useCallback(async (cubId: string | null) => {
    setActiveCubId(cubId);
    if (!cubId) { setActiveCub(null); return; }
    const found = cubs.find((c) => c.id === cubId);
    if (found) setActiveCub(found);
    if (currentUser && isLeaderEmail(currentUser.email)) {
      await setDoc(doc(db, 'users', currentUser.uid), {
        activeCubId: cubId || '',
        updatedAt: new Date().toISOString()
      }, { merge: true }).catch(console.error);
    }
  }, [cubs, currentUser]);

  const handleEmailSignIn = async (email: string, pass: string) => {
    setAuthError('');
    try {
      await signInWithEmailAndPassword(auth, email, pass);
    } catch (err: unknown) {
      const code = (err as { code?: string }).code || '';
      if (code === 'auth/user-not-found' || code === 'auth/wrong-password' || code === 'auth/invalid-credential') {
        setAuthError('البريد أو كلمة المرور غير صحيحة.');
      } else if (code === 'auth/network-request-failed') {
        setAuthError('فشل الاتصال بالخادم. تحقق من اتصال الإنترنت.');
      } else {
        setAuthError(`فشل تسجيل الدخول: ${(err as Error).message}`);
      }
    }
  };

  const handleEmailSignUp = async (data: {
    name: string;
    email: string;
    pass: string;
    phone: string;
    role: UserRole;
    age: string;
    stage: string;
    photo: string;
  }) => {
    setAuthError('');
    if (data.role === UserRole.LEADER && !isLeaderEmail(data.email)) {
      setAuthError('لا يمكن التسجيل كقائد إلا بالبريد الإلكتروني المصرح له.');
      return;
    }

    try {
      const cred = await createUserWithEmailAndPassword(auth, data.email, data.pass);
      const user = cred.user;
      await updateProfile(user, { displayName: data.name, photoURL: data.photo });

      const userData = sanitizeForFirestore({
        uid: user.uid,
        email: user.email,
        displayName: data.name,
        photoURL: data.photo,
        role: data.role,
        phone: data.phone,
        approved: true,
        createdAt: new Date().toISOString(),
        ...(data.role === UserRole.CUB && { age: data.age, stage: data.stage }),
      });

      await setDoc(doc(db, 'users', user.uid), userData, { merge: true });

      if (data.role === UserRole.CUB) {
        const cubData = sanitizeForFirestore({
          id: user.uid,
          name: data.name,
          age: parseInt(data.age) || 9,
          phone: data.phone,
          avatar: data.photo,
          level: (data.stage as CubLevel) || CubLevel.BEGINNER,
          sextetId: null,
          evaluation: { ...ZERO_EVALUATION },
          conduct: { ...ZERO_CONDUCT },
          requirements: [...MOBTADI_REQUIREMENTS],
          history: [],
          lastChecked: new Date().toISOString(),
          points: 0,
          gamesTotalPoints: 0,
          unlockedStories: [],
          currentStep: 1,
          approvedPromotionSteps: [],
          badges: [],
          status: 'approved',
          email: user.email,
        });

        await setDoc(doc(db, 'cubs', user.uid), cubData, { merge: true });
        await setDoc(doc(db, 'scouts', user.uid), sanitizeForFirestore({
          uid: user.uid,
          name: data.name,
          email: user.email || '',
          avatar: data.photo,
          createdAt: new Date().toISOString(),
          status: 'active',
          sextetId: null,
          approved: true,
          phone: data.phone,
        }), { merge: true });

        setRole(UserRole.CUB);
        setActiveCubId(user.uid);
        setActiveCub(cubData as unknown as Cub);
      } else if (data.role === UserRole.PARENT) {
        setRole(UserRole.PARENT);
        setShowLinkModal('intro');
      } else {
        setRole(UserRole.LEADER);
      }

      setSetupRequired(false);
      setView('dashboard');
      showToast('🎉 تم تسجيل حسابك الكشفي بنجاح!', 'success');
    } catch (err: unknown) {
      const code = (err as { code?: string }).code || '';
      if (code === 'auth/email-already-in-use') {
        setAuthError('البريد الإلكتروني مسجل مسبقاً. يرجى تسجيل الدخول.');
      } else {
        setAuthError(`فشل التسجيل: ${(err as Error).message}`);
      }
    }
  };

  const handleProfileSetupSubmit = async (data: {
    name: string;
    phone: string;
    email: string;
    role: UserRole;
    age: string;
    stage: string;
  }) => {
    if (!currentUser) return;
    setSubmittingSetup(true);
    try {
      const photo = currentUser.photoURL || '🦁';
      const userData = sanitizeForFirestore({
        uid: currentUser.uid,
        email: data.email || currentUser.email,
        displayName: data.name,
        photoURL: photo,
        role: data.role,
        phone: data.phone,
        approved: true,
        createdAt: new Date().toISOString(),
        ...(data.role === UserRole.CUB && { age: data.age, stage: data.stage }),
      });

      await setDoc(doc(db, 'users', currentUser.uid), userData, { merge: true });


      if (data.role === UserRole.CUB) {
        const existing = await getDoc(doc(db, 'cubs', currentUser.uid));
        if (!existing.exists()) {
          await setDoc(doc(db, 'cubs', currentUser.uid), sanitizeForFirestore({
            id: currentUser.uid,
            name: data.name,
            age: parseInt(data.age) || 9,
            phone: data.phone,
            avatar: photo,
            level: (data.stage as CubLevel) || CubLevel.BEGINNER,
            sextetId: null,
            evaluation: { ...ZERO_EVALUATION },
            conduct: { ...ZERO_CONDUCT },
            requirements: [...MOBTADI_REQUIREMENTS],
            history: [],
            lastChecked: new Date().toISOString(),
            points: 0,
            gamesTotalPoints: 0,
            unlockedStories: [],
            currentStep: 1,
            approvedPromotionSteps: [],
            badges: [],
            status: 'approved',
            email: currentUser.email,
          }), { merge: true });
        }
        setRole(UserRole.CUB);
        setActiveCubId(currentUser.uid);
      } else if (data.role === UserRole.PARENT) {
        setRole(UserRole.PARENT);
        setShowLinkModal('intro');
      } else {
        setRole(UserRole.LEADER);
      }

      setSetupRequired(false);
      setView('dashboard');
      showToast('تم حفظ ملفك الكشفي بنجاح!', 'success');
    } catch (err) {
      console.error(err);
      showToast('حدث خطأ أثناء الحفظ.', 'error');
    } finally {
      setSubmittingSetup(false);
    }
  };

  const handleSaveProfile = async (updates: {
    displayName: string;
    phone: string;
    photoURL: string;
    age: string;
    stage: string;
  }) => {
    if (!currentUser) return;
    const sanitized = sanitizeForFirestore(updates);
    await setDoc(doc(db, 'users', currentUser.uid), sanitized, { merge: true });
    if (role === UserRole.CUB) {
      await setDoc(doc(db, 'cubs', currentUser.uid), {
        avatar: updates.photoURL,
        name: updates.displayName,
        phone: updates.phone,
      }, { merge: true });

      if (activeCub?.id === currentUser.uid) {
        setActiveCub({
          ...activeCub,
          avatar: updates.photoURL,
          name: updates.displayName,
          phone: updates.phone,
        });
      }
    }
    showToast('تم تحديث الملف الشخصي بنجاح! 🌟', 'success');
  };

  // ── Points & Badges Handlers ────────────────────────────────────────────────
  const addPointsToCub = useCallback(async (
    cubId: string, pts: number,
    extraBadges: string[] = [],
    clearPendingHomeChallenge = false,
    customNotificationMessage?: string,
  ) => {
    if (role !== UserRole.LEADER) {
      const id = Math.random().toString(36).slice(2);
      const reason = extraBadges.length > 0 ? `إكمال تحدي: ${extraBadges.join(', ')}` : 'نقاط نشاط';
      try {
        await setDoc(doc(db, 'pendingPoints', id), {
          id, cubId, points: pts,
          taskName: reason, type: 'activity', reason,
          status: 'pending', createdAt: new Date().toISOString(),
        });
        showToast('تم إرسال نقاطك للقائد للمراجعة والاعتماد.', 'info');
      } catch (err) {
        console.error(err);
        showToast('تعذّر إرسال النقاط الآن، حاول مرة أخرى.', 'error');
      }
      return;
    }

    try {
      await atomicAddPoints(db, cubId, pts, extraBadges, {
        clearPendingHomeChallenge,
        notificationMessage: customNotificationMessage,
      });
      const cub = cubs.find((c) => c.id === cubId);
      if (cub?.sextetId && pts > 0) {
        await atomicUpdateSextetPoints(db, cub.sextetId, pts).catch(console.error);
      }
    } catch (err) {
      console.error(err);
      showToast('فشل تحديث النقاط.', 'error');
    }
  }, [role, cubs, showToast]);

  const addGamePointsToCub = useCallback(async (cubId: string, pts: number, extraBadges: string[] = []) => {
    if (role !== UserRole.LEADER) {
      await addPointsToCub(cubId, pts, extraBadges);
      return;
    }
    try {
      await atomicAddGamePoints(db, cubId, pts, extraBadges);
      const cub = cubs.find((c) => c.id === cubId);
      if (cub?.sextetId && pts > 0) {
        await atomicUpdateSextetPoints(db, cub.sextetId, pts).catch(console.error);
      }
    } catch (err) {
      console.error(err);
    }
  }, [cubs, role, addPointsToCub]);

  const toggleBadge = async (cubId: string, badgeName: string) => {
    const c = cubs.find((cub) => cub.id === cubId);
    if (!c) return;
    const has = c.badges.includes(badgeName);
    const updatedBadges = has ? c.badges.filter((b) => b !== badgeName) : [...c.badges, badgeName];
    if (!has) {
      const badge = AVAILABLE_BADGES.find((b) => b.name === badgeName);
      if (badge) setCelebratingBadge({ badge, cubName: c.name });
    }
    await setDoc(doc(db, 'cubs', cubId), sanitizeForFirestore({ ...c, badges: updatedBadges })).catch(console.error);
  };

  // ── Cub CRUD & Approvals ────────────────────────────────────────────────────
  const handleAddNewCub = async (form: {
    name: string;
    sextetId: string;
    age: string;
    phone: string;
    email: string;
  }) => {
    const id = `cub_${Date.now()}`;
    const cub = sanitizeForFirestore({
      id,
      name: form.name,
      age: parseInt(form.age) || 9,
      phone: form.phone,
      avatar: AVATARS[Math.floor(Math.random() * AVATARS.length)],
      level: CubLevel.ACCEPTANCE,
      sextetId: form.sextetId || null,
      evaluation: { ...ZERO_EVALUATION },
      conduct: { ...ZERO_CONDUCT },
      requirements: [...MOBTADI_REQUIREMENTS],
      history: [],
      lastChecked: new Date().toISOString(),
      points: 0,
      gamesTotalPoints: 0,
      unlockedStories: [],
      currentStep: 1,
      approvedPromotionSteps: [],
      badges: [],
      status: 'approved',
      email: form.email || '',
    });

    await setDoc(doc(db, 'cubs', id), cub);
    showToast(`تم إضافة الشبل ${form.name} بنجاح!`, 'success');
  };

  const deleteCub = async (cubId: string) => {
    try {
      await deleteDoc(doc(db, 'cubs', cubId));
      await deleteDoc(doc(db, 'scouts', cubId)).catch(console.error);
      await deleteRelationshipsForCub(cubId).catch(console.error);
      const newAtt = { ...attendance };
      delete newAtt[cubId];
      await updateDoc(doc(db, 'settings', 'global'), { attendance: newAtt });
      if (activeCub?.id === cubId || activeCubId === cubId) {
        handleSelectCub(null);
        handleSelectRole(null);
      }
      setCubToDelete(null);
      showToast('تم حذف الشبل بنجاح.', 'success');
    } catch (err) {
      console.error(err);
      showToast('فشل حذف الشبل.', 'error');
    }
  };

  const updateEvaluation = async (
    id: string, criteria: EvaluationCriteria, conduct?: ConductCriteria,
    level?: CubLevel, sextetId?: string, date?: string,
    overrideLastChecked?: string, earnedPoints = 0,
  ) => {
    const today = date || new Date().toISOString().split('T')[0];
    const c = cubs.find((cub) => cub.id === id);
    if (!c) return;
    const finalConduct = conduct || c.conduct;
    const cleanHistory = c.history.filter((h) => h.date !== today);
    const updatedCub = {
      ...c,
      evaluation: criteria,
      conduct: finalConduct,
      level: level || c.level,
      sextetId: sextetId !== undefined ? sextetId : c.sextetId,
      lastChecked: overrideLastChecked || today,
      history: [...cleanHistory, { date: today, ...criteria, conduct: finalConduct }],
    };

    await setDoc(doc(db, 'cubs', id), sanitizeForFirestore(updatedCub));
    if (earnedPoints > 0) await addPointsToCub(id, earnedPoints);
    await setDoc(doc(db, 'scouts', id), {
      name: updatedCub.name,
      avatar: updatedCub.avatar,
      sextetId: updatedCub.sextetId || null,
      status: 'active'
    }, { merge: true });
    setView('dashboard');
  };

  const toggleAttendance = async (cubId: string) => {
    const newAtt = { ...attendance, [cubId]: !attendance[cubId] };
    await updateDoc(doc(db, 'settings', 'global'), { attendance: newAtt }).catch(console.error);
  };

  const toggleGamesLocked = async () => {
    await updateDoc(doc(db, 'settings', 'global'), { gamesLocked: !gamesLocked }).catch(console.error);
  };

  // ── Meeting Handlers ────────────────────────────────────────────────────────
  const handleCreateMeeting = async (title: string, date: string) => {
    const id = Date.now().toString();
    await setDoc(doc(db, 'meetings', id), { id, date, title, attendees: [] }).catch(console.error);
  };

  const toggleMeetingAttendance = async (meetingId: string, cubId: string) => {
    const m = meetings.find((x) => x.id === meetingId);
    if (!m) return;
    const currentAttendance = m.attendance || {};
    const isPresent = !currentAttendance[cubId];
    const updatedAttendance = { ...currentAttendance, [cubId]: isPresent };
    const updatedAttendees = Object.keys(updatedAttendance).filter((id) => updatedAttendance[id]);
    await updateDoc(doc(db, 'meetings', meetingId), {
      attendees: updatedAttendees,
      attendance: updatedAttendance,
    }).catch(console.error);
  };

  const deleteMeeting = async (meetingId: string) => {
    await deleteDoc(doc(db, 'meetings', meetingId)).catch(console.error);
  };

  // ── Leader Actions ──────────────────────────────────────────────────────────
  const handleAddLeader = async (leader: {
    name: string;
    roleTitle: string;
    experienceYears: string;
    avatar: string;
  }) => {
    const id = `leader_${Date.now()}`;
    const newLeader: Leader = {
      id,
      name: leader.name,
      roleTitle: leader.roleTitle,
      avatar: leader.avatar,
      experienceYears: parseInt(leader.experienceYears) || 1,
      badges: [],
    };
    await setDoc(doc(db, 'leaders', id), newLeader).catch(console.error);
    showToast(`تم تسجيل القائد ${leader.name}! ⚜️`, 'success');
  };

  const handleConfirmTaskByParent = async (cubId: string, taskName: string) => {
    try {
      const id = Date.now().toString();
      await setDoc(doc(db, 'pendingPoints', id), {
        id, cubId, taskName, type: 'parent_task',
        status: 'pending', createdAt: new Date().toISOString(), points: 40,
        parentUid: currentUser?.uid || '',
        parentEmail: currentUser?.email || '',
      });
      setShowParentSuccessModal({ show: true, message: 'تم إرسال الإنجاز المنزلي للقائد للمراجعة.' });
      showToast('تم إرسال الإنجاز للقائد للمراجعة.', 'success');
    } catch (err) {
      console.error(err);
      showToast('لم يتم إرسال الإنجاز بسبب مشكلة في الصلاحيات.', 'error');
    }
  };

  const handleApproveRequest = async (requestId: string) => {
    if (role !== UserRole.LEADER) {
      showToast('هذه الصلاحية للقائد فقط.', 'warning');
      return;
    }
    const req = pendingPoints.find((r) => r.id === requestId);
    if (!req) return;
    await addPointsToCub(req.cubId, req.points);
    await updateDoc(doc(db, 'pendingPoints', requestId), { status: 'approved', approvedAt: new Date().toISOString() });
    showToast('تم اعتماد المهمة وإضافة النقاط بنجاح!', 'success');
  };

  const approveCubPromotion = async (cubId: string, stepNumber: number) => {
    const cub = cubs.find((c) => c.id === cubId);
    if (!cub) return;
    const levelMap: Record<number, CubLevel> = { 18: CubLevel.BEGINNER, 37: CubLevel.SECOND, 57: CubLevel.FIRST };
    const newLevel = levelMap[stepNumber] || cub.level;
    const approvedSteps = Array.from(new Set([...(cub.approvedPromotionSteps || []), stepNumber]));
    await updateDoc(doc(db, 'cubs', cubId), {
      approvedPromotionSteps: approvedSteps,
      pendingPromotionStep: null,
      level: newLevel,
      notificationMessage: `🥳 تمت ترقيتك إلى ${newLevel}!`,
    });
    showToast(`تم اعتماد المرتبة الكشفية: ${newLevel}`, 'success');
  };

  const handleWeeklyEvaluation = async (cubId: string) => {
    const cub = cubs.find((c) => c.id === cubId);
    if (!cub) return;
    const today = new Date().toISOString().split('T')[0];
    const newEval: WeeklyMeetingEvaluation = { cooperation: true, conduct: true, scoutSpirit: true, date: today };
    await updateDoc(doc(db, 'cubs', cubId), {
      weeklyEvaluations: [
        ...(cub.weeklyEvaluations || []).filter((e) => e.date !== today),
        newEval,
      ],
    });
    await addPointsToCub(cubId, 25);
    showToast(`تم رصد 25 نقطة للشبل ${cub.name}`, 'success');
  };

  const saveMonthlyReport = async (cubId: string) => {
    const cub = cubs.find((c) => c.id === cubId);
    if (!cub) return;
    const month = new Date().toLocaleString('ar-EG', { month: 'long' });
    const report: MonthlyReport = {
      month,
      attendanceContinuity: 4,
      technicalScoutingAspect: 85,
      externalActivities: 2,
      encouragementWord: 'شبل متميز وملتزم بالوعد والقانون الكشفي.',
      isStarOfMonth: true,
      totalPoints: cub.points,
    };
    await updateDoc(doc(db, 'cubs', cubId), {
      monthlyReports: [
        ...(cub.monthlyReports || []).filter((r) => r.month !== month),
        report,
      ],
    });
    showToast(`تم حفظ التقرير الشهري لـ ${cub.name}`, 'success');
  };

  const handleApprovePendingCub = async (cubId: string, name: string, selectedSextetId: string) => {
    if (!selectedSextetId) { showToast('يرجى تحديد السداسي أولاً!', 'warning'); return; }
    const pendingSnap = await getDoc(doc(db, 'pending_cubs', cubId));
    if (!pendingSnap.exists()) { showToast('لم يتم العثور على الطلب.', 'error'); return; }
    const approved = { ...pendingSnap.data(), sextetId: selectedSextetId, status: 'approved', approvedAt: new Date().toISOString() };
    await setDoc(doc(db, 'cubs', cubId), sanitizeForFirestore(approved), { merge: true });
    await setDoc(doc(db, 'scouts', cubId), sanitizeForFirestore(approved), { merge: true });
    await updateDoc(doc(db, 'users', cubId), { approved: true, role: UserRole.CUB });
    await deleteDoc(doc(db, 'pending_cubs', cubId));
    showToast(`✅ تمت الموافقة على ${name}!`, 'success');
  };

  // يُسند شبلًا مسجّلًا (بدون سداسي) إلى سداسي، بنفس طريقة الكتابة في cubs و scouts المستخدمة في updateEvaluation
  const handleAssignCubToSextet = async (cubId: string, selectedSextetId: string) => {
    if (!selectedSextetId) { showToast('يرجى تحديد السداسي أولاً!', 'warning'); return; }
    const cub = cubs.find((c) => c.id === cubId);
    const sextetName = sextets.find((s) => s.id === selectedSextetId)?.name || '';
    await setDoc(doc(db, 'cubs', cubId), { sextetId: selectedSextetId, updatedAt: new Date().toISOString() }, { merge: true });
    await setDoc(doc(db, 'scouts', cubId), { sextetId: selectedSextetId }, { merge: true });
    showToast(`✅ تمت إضافة ${cub?.name || 'الشبل'} إلى ${sextetName || 'السداسي'}`, 'success');
  };

  const handleRejectPendingCub = async (cubId: string, name: string) => {
    const ok = await showConfirm(`هل تريد رفض طلب الشبل "${name}"؟`);
    if (!ok) return;
    await deleteDoc(doc(db, 'pending_cubs', cubId));
    await deleteDoc(doc(db, 'users', cubId));
    await deleteDoc(doc(db, 'scouts', cubId));
    showToast(`تم رفض طلب ${name}.`, 'info');
  };

  const handleApproveUser = async (uid: string) => {
    await updateDoc(doc(db, 'users', uid), { approved: true });
    showToast('تم تفعيل الحساب!', 'success');
  };

  const handleRejectUser = async (uid: string) => {
    const ok = await showConfirm('هل تريد رفض وحذف هذا الطلب؟');
    if (!ok) return;
    await deleteDoc(doc(db, 'users', uid));
    await deleteDoc(doc(db, 'scouts', uid));
    await deleteDoc(doc(db, 'cubs', uid));
    showToast('تم رفض الطلب.', 'info');
  };

  const handleSelectChild = (cubId: string) => {
    setActiveCubId(cubId);
    try { localStorage.setItem('parent_active_cub', cubId); } catch { /* ignore */ }
  };

  // ═══════════════════════════════════════════════════════════════════════════
  // CONDITIONAL SCREENS
  // ═══════════════════════════════════════════════════════════════════════════

  // 1. Loading Screen
  if (authLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-scout-blue to-teal-950 flex flex-col items-center justify-center p-6 text-white text-center font-sans" dir="rtl">
        <Compass size={80} className="text-scout-yellow animate-spin mb-6" style={{ animationDuration: '3s' }} />
        <h2 className="text-2xl font-black">جاري تحميل منصة الأشبال الذكية... ⚜️</h2>
        <p className="text-white/60 text-sm font-bold animate-pulse mt-2">يرجى الانتظار...</p>
      </div>
    );
  }

  // 2. Not Logged In
  if (!currentUser) {
    return (
      <AuthScreen
        authError={authError}
        onSignIn={handleEmailSignIn}
        onSignUp={handleEmailSignUp}
        cubs={cubs}
      />
    );
  }

  // 3. Setup Required
  if (setupRequired) {
    return (
      <ProfileSetupModal
        currentUser={currentUser}
        onSubmit={handleProfileSetupSubmit}
        onLogout={handleLogout}
        submitting={submittingSetup}
        isLeaderEmail={isLeaderEmail}
        showToast={showToast}
      />
    );
  }

  // 4. Role Selection Required
  if (!role) {
    return (
      <RoleSelector
        currentUser={currentUser}
        onSelectRole={(r) => { handleSelectRole(r); setView('dashboard'); }}
        onLogout={handleLogout}
        isLeaderEmail={isLeaderEmail}
      />
    );
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // MAIN APPLICATION INTERFACE
  // ═══════════════════════════════════════════════════════════════════════════
  return (
    <AuthContext.Provider value={{ currentUser, userProfile, role, activeCub, authLoading }}>
      <div className="min-h-screen relative overflow-hidden bg-[radial-gradient(circle_at_top,_rgba(30,136,229,0.16),transparent_30%),linear-gradient(135deg,#f4f8ff_0%,#f8f5ea_45%,#edf9f1_100%)] dark:bg-[radial-gradient(circle_at_top,_rgba(56,189,248,0.18),transparent_30%),linear-gradient(135deg,#020817_0%,#0f172a_100%)] text-slate-800 dark:text-slate-100 font-sans pb-28 transition-colors duration-300">
        <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(120deg,transparent_0%,rgba(255,255,255,0.18)_30%,transparent_60%)] dark:bg-[linear-gradient(120deg,transparent_0%,rgba(148,163,184,0.08)_30%,transparent_60%)]" />
        <div className="relative z-10">

        {/* Global Modals */}
        <BadgeCelebrationModal
          celebratingBadge={celebratingBadge}
          onClose={() => setCelebratingBadge(null)}
        />

        <DeleteConfirmModal
          cubToDelete={cubToDelete}
          cubs={cubs}
          onConfirm={deleteCub}
          onCancel={() => setCubToDelete(null)}
        />

        {/* Parent Success Alert */}
        <AnimatePresence>
          {showParentSuccessModal?.show && (
            <div className="fixed inset-0 bg-black/60 backdrop-blur-md z-[5000] flex items-center justify-center p-4">
              <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.9, opacity: 0 }}
                className="w-full max-w-md bg-white rounded-[40px] shadow-2xl p-8 border-4 border-scout-yellow/30 text-center space-y-4"
              >
                <div className="w-16 h-16 bg-emerald-100 text-scout-green rounded-3xl flex items-center justify-center mx-auto">
                  <ShieldCheck size={36} />
                </div>
                <h3 className="text-2xl font-black text-scout-blue">أحسنتِ! 🌟</h3>
                <p className="text-slate-600 font-bold leading-relaxed">{showParentSuccessModal.message}</p>
                <button
                  onClick={() => setShowParentSuccessModal(null)}
                  className="w-full bg-scout-green text-white py-4 rounded-2xl font-black shadow-lg hover:bg-emerald-700 transition-all active:scale-95 cursor-pointer"
                >
                  متابعة
                </button>
              </motion.div>
            </div>
          )}
        </AnimatePresence>

        {/* Journey / Adventure Map */}
        <AnimatePresence>
          {showMap && activeCub && (
            <Suspense fallback={<TabLoadingSpinner />}>
              <TreasureAdventureMap cub={activeCub} onClose={() => setShowMap(false)} />
            </Suspense>
          )}
        </AnimatePresence>

        {/* Monthly Report Full Preview */}
        <Suspense fallback={null}>
          <MonthlyReportModal
            isOpen={!!selectedPreviewReport}
            onClose={() => setSelectedPreviewReport(null)}
            cub={selectedPreviewReport?.cub || null}
            report={selectedPreviewReport?.report || null}
            sextetName={
              selectedPreviewReport?.cub
                ? sextets.find((s) => s.id === selectedPreviewReport.cub.sextetId)?.name || 'غير محدد'
                : undefined
            }
          />
        </Suspense>

        {/* Add Cub Modal */}
        <AddCubModal
          isOpen={showAddCubModal}
          onClose={() => setShowAddCubModal(false)}
          sextets={sextets}
          onAddCub={handleAddNewCub}
          showToast={showToast}
        />

        {/* Add Leader Modal */}
        <AddLeaderModal
          isOpen={showAddLeaderModal}
          onClose={() => setShowAddLeaderModal(false)}
          onAddLeader={handleAddLeader}
          showToast={showToast}
        />

        {/* Notification Center */}
        <NotificationCenterModal
          isOpen={showNotificationCenter}
          onClose={() => setShowNotificationCenter(false)}
          activeCub={activeCub}
          onMarkAllRead={async () => {
            if (!activeCub) return;
            const updated = (activeCub.notifications || []).map((n) => ({ ...n, read: true }));
            setActiveCub({ ...activeCub, notifications: updated });
            await updateDoc(doc(db, 'cubs', activeCub.id), { notifications: updated }).catch(console.error);
          }}
        />

        {/* Link a cub to this parent */}
        {role === UserRole.PARENT && showLinkModal && currentUser && (
          <LinkCubModal
            mode={showLinkModal}
            parentUid={currentUser.uid}
            parentName={(userProfile?.displayName as string) || currentUser.displayName || 'ولي أمر'}
            existing={parentRelationships}
            onClose={() => setShowLinkModal(false)}
          />
        )}

        {/* Profile Edit Modal */}
        <ProfileEditModal
          isOpen={showProfileModal}
          onClose={() => setShowProfileModal(false)}
          currentUser={currentUser}
          userProfile={userProfile}
          role={role}
          activeCub={activeCub}
          onSaveProfile={handleSaveProfile}
          onLogout={handleLogout}
        />

        {/* ── Top Navigation Bar ── */}
        <nav className="fixed top-0 left-0 right-0 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md shadow-md z-50 px-6 py-4 border-b-4 border-scout-yellow transition-colors duration-300">
          <div className="max-w-7xl mx-auto flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="bg-scout-blue p-2 rounded-xl text-white shadow-sm">
                <Tent size={24} />
              </div>
              <span className="text-xl font-black text-scout-blue dark:text-scout-yellow">كشافة الأشبال ⚜️</span>
            </div>

            <div className="flex items-center gap-3">
              {/* Dark mode toggle */}
              <button
                onClick={() => setIsDarkMode(!isDarkMode)}
                className="p-2.5 bg-slate-100 dark:bg-slate-800 rounded-2xl active:scale-95 transition-all cursor-pointer border border-slate-200/60 dark:border-slate-700 shadow-sm"
                title={isDarkMode ? 'الوضع النهاري' : 'الوضع الليلي'}
              >
                {isDarkMode ? <Sun size={20} className="text-scout-yellow" /> : <Moon size={20} className="text-slate-600" />}
              </button>

              {/* Notification icon */}
              {activeCub && (
                <button
                  onClick={() => setShowNotificationCenter(true)}
                  className="relative p-2 hover:bg-scout-sand dark:hover:bg-slate-800 rounded-xl text-slate-400 transition-colors cursor-pointer"
                  title="التنبيهات"
                >
                  <MessageSquare size={20} />
                  {activeCub.notifications?.some((n) => !n.read) && (
                    <span className="absolute top-1 right-1 w-3 h-3 bg-red-500 border-2 border-white rounded-full animate-pulse" />
                  )}
                </button>
              )}

              {/* User profile dropdown button */}
              {currentUser && (
                <div className="flex items-center gap-2 border-l pl-3 border-slate-100 dark:border-slate-800">
                  <button
                    onClick={() => setShowProfileModal(true)}
                    className="flex items-center gap-2 hover:bg-slate-50 dark:hover:bg-slate-800 px-2 py-1 rounded-2xl border border-transparent hover:border-slate-100 dark:hover:border-slate-700 transition-all cursor-pointer"
                  >
                    <div className="w-8 h-8 rounded-full bg-scout-yellow/20 flex items-center justify-center font-bold text-base border-2 border-scout-yellow">
                      {(userProfile?.photoURL as string)?.length === 1 || (userProfile?.photoURL as string)?.length === 2
                        ? (userProfile?.photoURL as string)
                        : '🦁'}
                    </div>
                    <span className="hidden sm:inline text-xs font-black text-slate-700 dark:text-slate-200 max-w-[120px] truncate">
                      {(userProfile?.displayName as string) || currentUser.displayName || currentUser.email}
                    </span>
                  </button>
                  <button
                    onClick={handleLogout}
                    className="p-1 hover:bg-red-50 dark:hover:bg-red-950/30 text-slate-400 hover:text-red-500 rounded-lg transition-colors cursor-pointer"
                    title="تسجيل الخروج"
                  >
                    <LogOut size={16} />
                  </button>
                </div>
              )}

              {/* Current Role Badge */}
              <div className="flex items-center gap-2 text-sm font-bold bg-scout-yellow text-slate-800 px-4 py-2 rounded-full shadow-sm">
                <Star size={16} fill="currentColor" />
                <span className="hidden sm:inline">
                  {role === UserRole.LEADER ? 'نظام القائد' : role === UserRole.CUB ? 'بوابة الشبل' : 'متابعة أولياء الأمور'}
                </span>
              </div>

              {/* Switch Role Button */}
              <button
                onClick={() => { handleSelectRole(null); handleSelectCub(null); }}
                className="p-2 hover:bg-scout-sand dark:hover:bg-slate-800 rounded-xl text-slate-400 transition-colors cursor-pointer"
                title="تغيير الدور"
              >
                <Settings size={20} />
              </button>
            </div>
          </div>
        </nav>

        {/* ── Main Tab Router (Lazy Loaded with Scout Suspense) ── */}
        <main className="max-w-7xl mx-auto px-4 sm:px-6 pt-28">
          {role === UserRole.CUB && currentUser && <CubLinkRequestsBanner cubUid={currentUser.uid} />}
          <AnimatePresence mode="wait">
            <motion.div key={view} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
              <Suspense fallback={<TabLoadingSpinner />}>
                {view === 'dashboard' && (
                  <DashboardTab
                    role={role}
                    currentUser={currentUser}
                    userProfile={userProfile}
                    activeCub={activeCub}
                    cubs={cubs}
                    sextets={sextets}
                    pendingPoints={pendingPoints}
                    globalTasks={globalTasks}
                    safetyReports={safetyReports}
                    onDeleteCub={(id) => setCubToDelete(id)}
                    onSelectCub={handleSelectCub}
                    onWeeklyEvaluation={handleWeeklyEvaluation}
                    onSaveMonthlyReport={saveMonthlyReport}
                    onApprovePendingCub={handleApprovePendingCub}
                    onAssignCubToSextet={handleAssignCubToSextet}
                    onRejectPendingCub={handleRejectPendingCub}
                    onApproveUser={handleApproveUser}
                    onRejectUser={handleRejectUser}
                    onApproveRequest={handleApproveRequest}
                    onApprovePromotion={approveCubPromotion}
                    onToggleGamesLocked={toggleGamesLocked}
                    gamesLocked={gamesLocked}
                    setShowAddCubModal={setShowAddCubModal}
                    setShowAddLeaderModal={setShowAddLeaderModal}
                    setShowMap={setShowMap}
                    showMap={showMap}
                    setView={setView}
                    showToast={showToast}
                    showConfirm={showConfirm}
                    onConfirmTaskByParent={handleConfirmTaskByParent}
                    parentChildren={Object.values(linkedCubsById)}
                    parentRelationships={parentRelationships}
                    onSelectChild={handleSelectChild}
                    onOpenLinkModal={() => setShowLinkModal('code')}
                  />
                )}
                {view === 'evaluate' && (
                  <EvaluateTab
                    cubs={cubs}
                    onUpdateEvaluation={updateEvaluation}
                    showToast={showToast}
                    setView={setView}
                    initialCubId={activeCubId || undefined}
                  />
                )}
                {view === 'activities' && (
                  <ActivitiesTab
                    role={role}
                    activeCub={activeCub}
                    onAddPoints={addGamePointsToCub}
                    showToast={showToast}
                  />
                )}
                {view === 'badges' && (
                  <BadgesTab
                    role={role}
                    activeCub={activeCub}
                    cubs={cubs}
                    onToggleBadge={toggleBadge}
                    showToast={showToast}
                  />
                )}
                {view === 'leaderboard' && (
                  <LeaderboardTab cubs={cubs} sextets={sextets} />
                )}
                {view === 'safeFromHarm' && (
                  <SafeFromHarmTab
                    role={role}
                    activeCub={activeCub}
                    onAddPoints={async (cubId, pts) => addPointsToCub(cubId, pts)}
                    showToast={showToast}
                  />
                )}
                {view === 'sdgHeroes' && (
                  <SdgHeroesTab
                    role={role}
                    activeCub={activeCub}
                    onAddPoints={async (cubId, pts) => addPointsToCub(cubId, pts)}
                    showToast={showToast}
                  />
                )}
                {view === 'law' && <LawTab />}
                {view === 'meetings' && (
                  <MeetingsTab
                    role={role}
                    meetings={meetings}
                    cubs={cubs}
                    onCreateMeeting={handleCreateMeeting}
                    onToggleMeetingAttendance={toggleMeetingAttendance}
                    onDeleteMeeting={deleteMeeting}
                    showToast={showToast}
                  />
                )}
              </Suspense>
            </motion.div>
          </AnimatePresence>
        </main>

        {/* ── Fixed Bottom Navigation ── */}
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 bg-scout-blue/95 dark:bg-slate-900/95 backdrop-blur-md px-4 py-3 rounded-3xl shadow-2xl flex items-center gap-4 sm:gap-6 md:gap-10 z-50 border border-white/20">
          {[
            { id: 'dashboard',   icon: <Users size={24} />,       label: role === UserRole.LEADER ? 'الأشبال' : 'الرئيسية' },
            ...(role === UserRole.LEADER ? [{ id: 'meetings', icon: <Calendar size={24} />, label: 'الاجتماعات' }] : []),
            ...(role !== UserRole.PARENT ? [{ id: 'activities', icon: <Gamepad2 size={24} />, label: 'الألعاب' }] : []),
            { id: 'badges',      icon: <Star size={24} />,        label: 'الأوسمة' },
            { id: 'leaderboard', icon: <Trophy size={24} />,      label: 'المتصدرين' },
            { id: 'safeFromHarm',icon: <ShieldCheck size={24} />, label: 'الحماية' },
            { id: 'sdgHeroes', icon: <span className="text-xl">🌱</span>, label: 'أبطال التنمية المستدامة' },
            { id: 'law',         icon: <MapIcon size={24} />,     label: 'القانون' },
          ].map((item) => (
            <button
              key={item.id}
              onClick={() => {
                if (item.id === 'activities' && gamesLocked && role === UserRole.CUB) {
                  showToast('الألعاب مغلقة حالياً من قبل القائد.', 'warning');
                  return;
                }
                setView(item.id as typeof view);
              }}
              className={`flex flex-col items-center gap-1 transition-all cursor-pointer ${
                view === item.id ? 'text-scout-yellow scale-110' : 'text-white/60 hover:text-white'
              }`}
            >
              <div className="relative">
                {item.icon}
                {item.id === 'activities' && gamesLocked && role === UserRole.CUB && (
                  <Lock size={12} className="absolute -top-1 -right-1 text-red-400" />
                )}
              </div>
              <span className="text-[10px] font-bold hidden sm:block">{item.label}</span>
            </button>
          ))}
        </div>

        </div>
      </div>
    </AuthContext.Provider>
  );
}

// ─── Root Export ──────────────────────────────────────────────────────────────
export default function App() {
  return (
    <ToastProvider>
      <AppInner />
    </ToastProvider>
  );
}
