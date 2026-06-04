import { createClient } from '@supabase/supabase-js'

// ─── 환경변수 ─────────────────────────────────────────────────
// .env.local 에 아래 두 줄을 추가하세요:
// VITE_SUPABASE_URL=https://xxxx.supabase.co
// VITE_SUPABASE_ANON_KEY=eyJ...

const SUPABASE_URL      = import.meta.env.VITE_SUPABASE_URL      ?? ''
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY ?? ''

export const isConfigured = !!(SUPABASE_URL && SUPABASE_ANON_KEY)

export const supabase = isConfigured
  ? createClient(SUPABASE_URL, SUPABASE_ANON_KEY)
  : null

// ─── Auth ────────────────────────────────────────────────────

export async function loginWithGoogle() {
  if (!supabase) throw new Error('Supabase 미설정')
  const { error } = await supabase.auth.signInWithOAuth({
    provider: 'google',
    options:  { redirectTo: `${window.location.origin}/` },
  })
  if (error) throw error
}

export async function loginWithGithub() {
  if (!supabase) throw new Error('Supabase 미설정')
  const { error } = await supabase.auth.signInWithOAuth({
    provider: 'github',
    options:  { redirectTo: `${window.location.origin}/` },
  })
  if (error) throw error
}

export async function logout() {
  if (!supabase) return
  await supabase.auth.signOut()
}

export function onAuthChange(
  callback: (user: { id: string; name: string } | null) => void,
): () => void {
  if (!supabase) { callback(null); return () => {} }

  // 초기 세션 확인
  supabase.auth.getSession().then(({ data }) => {
    const user = data.session?.user
    if (user) callback({ id: user.id, name: displayName(user) })
  })

  const { data: { subscription } } = supabase.auth.onAuthStateChange((_ev, session) => {
    const user = session?.user ?? null
    callback(user ? { id: user.id, name: displayName(user) } : null)
  })

  return () => subscription.unsubscribe()
}

function displayName(user: { user_metadata?: Record<string,unknown>; email?: string }): string {
  return (
    (user.user_metadata?.full_name as string) ||
    (user.user_metadata?.user_name as string) ||
    (user.email?.split('@')[0]) ||
    'AGENT'
  )
}

// ─── DB (players 테이블) ──────────────────────────────────────

export interface PlayerRow {
  id:          string
  nickname:    string
  rank_points: number
  coins:       number
  rating:      number
}

/** 플레이어 생성 또는 닉네임 갱신 (upsert) */
export async function upsertPlayer(p: { id: string; nickname: string }) {
  if (!supabase) return
  await supabase.from('players').upsert(
    { id: p.id, nickname: p.nickname },
    { onConflict: 'id', ignoreDuplicates: false },
  )
}

/** RP 증가 (Postgres RPC 사용) */
export async function addRp(id: string, rp: number, nickname: string) {
  if (!supabase) return
  // 플레이어 행이 없을 때만 삽입 (ignoreDuplicates: true = 충돌 시 아무것도 하지 않음)
  // rank_points: rp 로 초기화하면 기존 RP가 덮어쓰여지는 버그 발생 → 0으로 초기화
  await supabase.from('players').upsert(
    { id, nickname, rank_points: 0, coins: 0, rating: 1000 },
    { onConflict: 'id', ignoreDuplicates: true },
  )
  // 기존 RP에 원자적으로 더하기
  await supabase.rpc('increment_rp', { player_id: id, amount: rp })
}

/** 글로벌 리더보드 상위 N명 */
export async function fetchLeaderboard(top = 20): Promise<PlayerRow[]> {
  if (!supabase) return []
  const { data, error } = await supabase
    .from('players')
    .select('id, nickname, rank_points, coins, rating')
    .order('rank_points', { ascending: false })
    .limit(top)
  if (error) { console.warn('[supabase]', error.message); return [] }
  return (data ?? []) as PlayerRow[]
}

/** 플레이어 단일 조회 */
export async function getPlayer(id: string): Promise<PlayerRow | null> {
  if (!supabase) return null
  const { data } = await supabase.from('players').select('*').eq('id', id).single()
  return data as PlayerRow | null
}
