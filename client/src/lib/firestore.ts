import {
  doc, setDoc, getDoc, collection,
  query, orderBy, limit, getDocs,
  serverTimestamp, increment,
} from 'firebase/firestore'
import { db, isConfigured } from './firebase'

// ── 플레이어 문서 타입 ───────────────────────────────────────
interface PlayerDoc {
  uid:        string
  nickname:   string
  rankPoints: number
  coins:      number
  rating:     number
  updatedAt:  unknown
}

// ── 플레이어 저장 / 업데이트 ─────────────────────────────────
export async function savePlayer(uid: string, data: Partial<PlayerDoc>): Promise<void> {
  if (!db || !isConfigured) return
  await setDoc(doc(db, 'players', uid), { ...data, updatedAt: serverTimestamp() }, { merge: true })
}

// ── 플레이어 불러오기 ────────────────────────────────────────
export async function loadPlayer(uid: string): Promise<PlayerDoc | null> {
  if (!db || !isConfigured) return null
  const snap = await getDoc(doc(db, 'players', uid))
  return snap.exists() ? (snap.data() as PlayerDoc) : null
}

// ── RP 누적 (원자적 증가) ─────────────────────────────────────
export async function addRpToFirestore(uid: string, rp: number, nickname: string): Promise<void> {
  if (!db || !isConfigured) return
  await setDoc(
    doc(db, 'players', uid),
    { rankPoints: increment(rp), nickname, updatedAt: serverTimestamp() },
    { merge: true },
  )
}

// ── 글로벌 리더보드 상위 20명 ─────────────────────────────────
export interface LeaderboardEntry {
  uid:        string
  nickname:   string
  rankPoints: number
}

export async function fetchLeaderboard(top = 20): Promise<LeaderboardEntry[]> {
  if (!db || !isConfigured) return []
  const q    = query(collection(db, 'players'), orderBy('rankPoints', 'desc'), limit(top))
  const snap = await getDocs(q)
  return snap.docs.map(d => {
    const data = d.data() as PlayerDoc
    return { uid: d.id, nickname: data.nickname, rankPoints: data.rankPoints }
  })
}
