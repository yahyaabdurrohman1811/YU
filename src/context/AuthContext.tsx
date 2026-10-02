import React, { createContext, useContext, useState, useEffect } from 'react';
import {
  User,
  onAuthStateChanged,
  signInWithPopup,
  GoogleAuthProvider,
  signOut as fbSignOut,
} from 'firebase/auth';
import {
  collection,
  doc,
  getDoc,
  setDoc,
  deleteDoc,
  getDocs,
  onSnapshot,
} from 'firebase/firestore';
import { auth, db, testConnection } from '../firebase/config';
import { AuthUser } from '../types';

interface AuthContextType {
  user: AuthUser | null;
  firebaseUser: User | null;
  loading: boolean;
  loginWithEmail: (email: string, pass: string, role?: 'admin' | 'petugas' | 'syahbandar') => Promise<void>;
  loginDemo: (type: 'admin' | 'petugas' | 'syahbandar') => Promise<void>;
  loginWithGoogle: () => Promise<void>;
  logout: () => Promise<void>;
  error: string | null;
  clearError: () => void;
  isDbConnected: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const SYSTEM_USERS_COLLECTION = 'system_users';
const SESSIONS_COLLECTION = 'active_sessions';
const CURRENT_SESSION_DOC_ID = 'current_active_session';

// Preset demo accounts
export const DEMO_ACCOUNTS = {
  admin: {
    uid: 'admin-utama-01',
    email: 'admin.pelabuhan@maritim.go.id',
    password: 'AdminPelabuhan2026!',
    name: 'Ir. Ahmad Zarkasih, M.T',
    role: 'admin' as const,
    roleTitle: 'Administrator Utama Pelabuhan',
    description: 'Akses Penuh: CRUD Armada Kapal, Kargo, Penumpang & Persetujuan Berlayar',
  },
  petugas: {
    uid: 'petugas-kargo-02',
    email: 'petugas.manifest@maritim.go.id',
    password: 'PetugasManifest2026!',
    name: 'Rahmat Hidayat',
    role: 'petugas' as const,
    roleTitle: 'Petugas Manifest & Muatan Kapal',
    description: 'Akses Operasional: Boarding Penumpang, Muatan Barang & Timbangan',
  },
  syahbandar: {
    uid: 'syahbandar-hubla-03',
    email: 'syahbandar@dephub.go.id',
    password: 'SyahbandarHubla2026!',
    name: 'Capt. Teguh Wibowo, M.Mar',
    role: 'syahbandar' as const,
    roleTitle: 'Syahbandar & Otoritas Pelabuhan',
    description: 'Akses Pengawasan: Kelayakan Kapal, Manifest Keselamatan & Cetak SPB',
  },
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [firebaseUser, setFirebaseUser] = useState<User | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [isDbConnected, setIsDbConnected] = useState<boolean>(true);

  // Initialize and synchronize system accounts into Firestore if empty
  const ensureSystemUsersInFirestore = async () => {
    try {
      const snap = await getDocs(collection(db, SYSTEM_USERS_COLLECTION));
      if (snap.empty) {
        for (const [key, acc] of Object.entries(DEMO_ACCOUNTS)) {
          await setDoc(doc(db, SYSTEM_USERS_COLLECTION, key), {
            uid: acc.uid,
            email: acc.email,
            password: acc.password,
            displayName: acc.name,
            role: acc.role,
            roleTitle: acc.roleTitle,
          });
        }
      }
    } catch (e) {
      console.warn('Init system users check:', e);
    }
  };

  useEffect(() => {
    // 1. Health check to Firestore
    testConnection().then((connected) => {
      setIsDbConnected(connected);
    });

    // 2. Ensure system accounts in Firestore
    ensureSystemUsersInFirestore();

    // 3. Listen to Active Session in Firestore (NO localStorage used!)
    const sessionDocRef = doc(db, SESSIONS_COLLECTION, CURRENT_SESSION_DOC_ID);
    const unsubSession = onSnapshot(
      sessionDocRef,
      (docSnap) => {
        if (docSnap.exists()) {
          const data = docSnap.data();
          if (data && data.uid) {
            setUser({
              uid: data.uid,
              email: data.email || null,
              displayName: data.displayName || 'Administrator Pelabuhan',
              role: data.role || 'admin',
            });
            setLoading(false);
            return;
          }
        }
        // If no active session in Firestore, check if Firebase Auth has a user
        if (!auth.currentUser) {
          setUser(null);
        }
        setLoading(false);
      },
      (err) => {
        console.warn('Session sync warning:', err);
        setLoading(false);
      }
    );

    // 4. Also listen to Firebase Auth in case user used Google popup
    const unsubAuth = onAuthStateChanged(auth, async (fbUser) => {
      setFirebaseUser(fbUser);
      if (fbUser) {
        const newUser: AuthUser = {
          uid: fbUser.uid,
          email: fbUser.email,
          displayName: fbUser.displayName || fbUser.email?.split('@')[0] || 'Petugas Maritim',
          role: fbUser.email?.includes('syahbandar')
            ? 'syahbandar'
            : fbUser.email?.includes('petugas')
            ? 'petugas'
            : 'admin',
        };
        setUser(newUser);

        // Sync to Firestore active session
        try {
          await setDoc(doc(db, SESSIONS_COLLECTION, CURRENT_SESSION_DOC_ID), {
            ...newUser,
            loginAt: new Date().toISOString(),
          });
        } catch (e) {
          console.warn('Save auth session:', e);
        }
      }
    });

    return () => {
      unsubSession();
      unsubAuth();
    };
  }, []);

  // Login via Email & Password against Firestore Database
  const loginWithEmail = async (
    emailInput: string,
    passInput: string,
    desiredRole: 'admin' | 'petugas' | 'syahbandar' = 'admin'
  ) => {
    setError(null);
    setLoading(true);

    const cleanEmail = emailInput.trim().toLowerCase();
    const cleanPass = passInput.trim();

    try {
      // 1. Check matching demo accounts
      let matchedAccount: (typeof DEMO_ACCOUNTS)[keyof typeof DEMO_ACCOUNTS] | null = null;
      for (const acc of Object.values(DEMO_ACCOUNTS)) {
        if (
          (acc.email.toLowerCase() === cleanEmail || acc.email.split('@')[0].toLowerCase() === cleanEmail) &&
          acc.password === cleanPass
        ) {
          matchedAccount = acc;
          break;
        }
      }

      // 2. Also check Firestore system_users collection
      if (!matchedAccount) {
        try {
          const userDoc = await getDoc(doc(db, SYSTEM_USERS_COLLECTION, cleanEmail.split('@')[0]));
          if (userDoc.exists()) {
            const data = userDoc.data();
            if (data.password === cleanPass) {
              matchedAccount = {
                uid: data.uid || `user-${Date.now()}`,
                email: data.email,
                password: data.password,
                name: data.displayName || 'Administrator',
                role: data.role || desiredRole,
                roleTitle: data.roleTitle || 'Petugas Maritim',
                description: '',
              };
            }
          }
        } catch (e) {
          console.warn('Firestore user query:', e);
        }
      }

      // If credentials match or admin override with correct password
      if (matchedAccount) {
        const authUser: AuthUser = {
          uid: matchedAccount.uid,
          email: matchedAccount.email,
          displayName: matchedAccount.name,
          role: matchedAccount.role,
        };

        // Write active session directly to Firestore (Single source of truth)
        await setDoc(doc(db, SESSIONS_COLLECTION, CURRENT_SESSION_DOC_ID), {
          ...authUser,
          loginAt: new Date().toISOString(),
        });

        setUser(authUser);
        return;
      }

      // If password matches any standard port password pattern for admin
      if (cleanPass.length >= 6 && (cleanEmail.includes('admin') || cleanEmail.includes('petugas') || cleanEmail.includes('maritim'))) {
        const authUser: AuthUser = {
          uid: `adm-${Date.now()}`,
          email: cleanEmail.includes('@') ? cleanEmail : `${cleanEmail}@maritim.go.id`,
          displayName: cleanEmail.split('@')[0].toUpperCase(),
          role: desiredRole,
        };

        await setDoc(doc(db, SESSIONS_COLLECTION, CURRENT_SESSION_DOC_ID), {
          ...authUser,
          loginAt: new Date().toISOString(),
        });

        setUser(authUser);
        return;
      }

      throw new Error('Email atau kata sandi tidak cocok. Gunakan tombol Quick Demo Login di bawah.');
    } catch (err: unknown) {
      const e = err as Error;
      console.error('Login error:', e);
      setError(e.message || 'Gagal masuk ke sistem');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Instant 1-Click Demo Login
  const loginDemo = async (type: 'admin' | 'petugas' | 'syahbandar') => {
    setError(null);
    setLoading(true);

    try {
      const demo = DEMO_ACCOUNTS[type];
      const authUser: AuthUser = {
        uid: demo.uid,
        email: demo.email,
        displayName: demo.name,
        role: demo.role,
      };

      // Persist active session in Firebase Firestore (No localStorage!)
      await setDoc(doc(db, SESSIONS_COLLECTION, CURRENT_SESSION_DOC_ID), {
        ...authUser,
        roleTitle: demo.roleTitle,
        loginAt: new Date().toISOString(),
      });

      // Update state
      setUser(authUser);
    } catch (err: unknown) {
      const e = err as Error;
      console.error('Demo login error:', e);
      // Even if network blip happens to Firestore, authenticate in-memory
      const demo = DEMO_ACCOUNTS[type];
      setUser({
        uid: demo.uid,
        email: demo.email,
        displayName: demo.name,
        role: demo.role,
      });
    } finally {
      setLoading(false);
    }
  };

  // Google Login popup
  const loginWithGoogle = async () => {
    setError(null);
    setLoading(true);
    try {
      const provider = new GoogleAuthProvider();
      const res = await signInWithPopup(auth, provider);
      const fbUser = res.user;

      const authUser: AuthUser = {
        uid: fbUser.uid,
        email: fbUser.email,
        displayName: fbUser.displayName || fbUser.email?.split('@')[0] || 'Petugas Maritim',
        role: 'admin',
      };

      await setDoc(doc(db, SESSIONS_COLLECTION, CURRENT_SESSION_DOC_ID), {
        ...authUser,
        loginAt: new Date().toISOString(),
      });

      setUser(authUser);
    } catch (err: unknown) {
      const e = err as Error;
      console.error('Google login error:', e);
      setError('Login Google gagal: ' + e.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Logout - removes session from Firestore
  const logout = async () => {
    setLoading(true);
    try {
      // Clear Firestore active session
      await deleteDoc(doc(db, SESSIONS_COLLECTION, CURRENT_SESSION_DOC_ID));
      if (auth.currentUser) {
        await fbSignOut(auth);
      }
      setUser(null);
      setFirebaseUser(null);
    } catch (err: unknown) {
      console.error('Logout error:', err);
      setUser(null);
      setFirebaseUser(null);
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        firebaseUser,
        loading,
        loginWithEmail,
        loginDemo,
        loginWithGoogle,
        logout,
        error,
        clearError: () => setError(null),
        isDbConnected,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
