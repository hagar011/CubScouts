import { initializeApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider, signInWithPopup } from 'firebase/auth';
import { 
  initializeFirestore, 
  persistentLocalCache, 
  persistentMultipleTabManager,
  doc, 
  getDoc, 
  setDoc,
  getDocFromServer
} from 'firebase/firestore';

const firebaseConfig = {
  apiKey: "AIzaSyBWJU06kPGAnvMBJ7BXHRlfyN3iUsr3y98",
  authDomain: "cub-scout-system.firebaseapp.com",
  projectId: "cub-scout-system",
  storageBucket: "cub-scout-system.firebasestorage.app",
  messagingSenderId: "128610162812",
  appId: "1:128610162812:web:ac80c24e5f05eda20691f9",
  measurementId: "G-PVKK55E03E"
};

const app = initializeApp(firebaseConfig);

// تفعيل ميزة التخزين المؤقت وحفظ التحديثات أوفلاين (Firestore Persistent Cache Offline support)
export const db = initializeFirestore(app, {
  localCache: persistentLocalCache({
    tabManager: persistentMultipleTabManager()
  })
});

export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();
googleProvider.setCustomParameters({ prompt: 'select_account' });

// دالة اختبار الاتصال المعتمدة لـ Firestore للتأكد من حالة الاتصال وإمكانية القراءة
async function testConnection() {
  try {
    await getDocFromServer(doc(db, 'settings', 'global'));
    console.log("[DEBUG] Firestore connection successfully verified online.");
  } catch (error) {
    if (error instanceof Error && error.message.includes('offline')) {
      console.warn("[DEBUG] Firestore client is running in offline mode. Local cache enabled.");
    }
  }
}
testConnection();

export const loginWithGoogle = async () => {
  try {
    const result = await signInWithPopup(auth, googleProvider);
    const user = result.user;
    const userRef = doc(db, 'users', user.uid);
    const userSnap = await getDoc(userRef);

    // إذا أول تسجيل دخول، نقوم بإنشاء سجل المستخدم وتأكيد الدور الافتراضي
    if (!userSnap.exists()) {
      const isLeader = user.email === "hagar01124@gmail.com";
      const determinedRole = isLeader ? 'leader' : 'cub';
      
      await setDoc(userRef, {
        uid: user.uid,
       displayName: user.displayName || 'مغامر جديد',
        email: user.email || '',
        photoURL: user.photoURL || '🦁',
        role: determinedRole,
        approved: true,
        createdAt: new Date().toISOString()
      }, { merge: true });

      console.log("[DEBUG] New Google User registered successfully:", determinedRole);
      return;
    }

    const userData = userSnap.data();
    const role = userData?.role || 'cub';
    console.log("[DEBUG] Returning Google User logged in successfully with role:", role);
  } catch (error) {
    console.error("[DEBUG] Google Sign-In Error: ", error);
    throw error;
  }
};
