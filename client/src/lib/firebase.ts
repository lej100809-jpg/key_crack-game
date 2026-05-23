import { initializeApp } from 'firebase/app'
import {
  getAuth,
  GoogleAuthProvider,
  GithubAuthProvider,
  signInWithPopup,
  signOut as fbSignOut,
  onAuthStateChanged,
  type User,
} from 'firebase/auth'
import { getFirestore } from 'firebase/firestore'

// ─── Firebase 설정 ───────────────────────────────────────────
// .env.local 파일에 아래 키를 설정하세요:
// VITE_FIREBASE_API_KEY=...
// VITE_FIREBASE_AUTH_DOMAIN=...
// VITE_FIREBASE_PROJECT_ID=...
// VITE_FIREBASE_APP_ID=...

const firebaseConfig = {
  apiKey:            import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain:        import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId:         import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket:     import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId:             import.meta.env.VITE_FIREBASE_APP_ID,
}

const isConfigured = !!firebaseConfig.apiKey

// 설정 없으면 더미 앱 (게스트 모드만 동작)
const app  = isConfigured ? initializeApp(firebaseConfig) : initializeApp({ apiKey: 'DEMO', projectId: 'demo' }, 'demo')
const auth = isConfigured ? getAuth(app) : null
const db   = isConfigured ? getFirestore(app) : null

// ─── 로그인 함수 ─────────────────────────────────────────────

export async function loginWithGoogle(): Promise<User> {
  if (!auth) throw new Error('Firebase가 설정되지 않았습니다.')
  const provider = new GoogleAuthProvider()
  const result   = await signInWithPopup(auth, provider)
  return result.user
}

export async function loginWithGithub(): Promise<User> {
  if (!auth) throw new Error('Firebase가 설정되지 않았습니다.')
  const provider = new GithubAuthProvider()
  const result   = await signInWithPopup(auth, provider)
  return result.user
}

export async function logout(): Promise<void> {
  if (auth) await fbSignOut(auth)
}

export function onAuthChange(callback: (user: User | null) => void): () => void {
  if (!auth) { callback(null); return () => {} }
  return onAuthStateChanged(auth, callback)
}

export { auth, db, isConfigured }
export type { User }
