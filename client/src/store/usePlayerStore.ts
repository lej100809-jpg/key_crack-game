import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { Player, Badge, GameMode } from '@/types'
import { getSkin, AGENT_SKINS } from '@/data/shopItems'
import type { AgentSkin } from '@/data/shopItems'
import type { ScoreRecord } from '@/data/rankSystem'

// ─── 인벤토리 타입 ─────────────────────────────────────────────────────────────

export interface Inventory {
  hints:       number   // 보유 긴급 힌트 횟수
  timeExtends: number   // 시간 연장권 개수
  revives:     number   // 부활권 개수
}

// ─── 스토어 타입 ──────────────────────────────────────────────────────────────

interface PlayerState {
  player:          Player | null
  inventory:       Inventory
  ownedSkins:      string[]
  ownedTitles:     string[]
  ownedChallenges: string[]
  equippedSkin:    string
  equippedTitle:   string
  rankPoints:      number          // 누적 랭킹 포인트
  scoreHistory:    ScoreRecord[]   // 최근 50개
}

interface PlayerActions {
  initPlayer:     (id: string, nickname: string) => void
  setPlayer:      (player: Player) => void
  addCoins:       (amount: number) => void
  addBadge:       (badge: Badge) => void
  updateRating:   (delta: number) => void
  unlockMode:     (mode: GameMode) => void
  clearPlayer:    () => void

  /** 랭킹 포인트 추가 + 기록 저장 */
  addRankPoints:  (rp: number, record: Omit<ScoreRecord, 'id' | 'ts'>) => void

  // 상점
  buyItem:        (itemId: string, price: number, category: string, value?: number) => boolean
  equipSkin:      (skinId: string) => void
  equipTitle:     (titleId: string) => void
  unequipTitle:   () => void

  // 소모품 사용
  useHint:        () => boolean
  useTimeExtend:  () => number | false   // false = 없음, 숫자 = 연장 초
  useRevive:      () => boolean
}

// ─── 초기값 ────────────────────────────────────────────────────────────────────

const DEFAULT_INVENTORY: Inventory = { hints: 0, timeExtends: 0, revives: 0 }

// ─── CSS 변수 적용 ─────────────────────────────────────────────────────────────

function applyTheme(skin: AgentSkin) {
  const root = document.documentElement
  Object.entries(skin.cssVars).forEach(([k, v]) => root.style.setProperty(k, v))
}

// ─── Store ─────────────────────────────────────────────────────────────────────

export const usePlayerStore = create<PlayerState & PlayerActions>()(
  persist(
    (set, get) => ({
      player:           null,
      inventory:        { ...DEFAULT_INVENTORY },
      rankPoints:       0,
      scoreHistory:     [],
      ownedSkins:       ['skin_cipher'],
      ownedTitles:      [],
      ownedChallenges:  [],
      equippedSkin:     'skin_cipher',
      equippedTitle:    '',

      // ── 플레이어 ──────────────────────────────────────────
      initPlayer: (id, nickname) => {
        const existing = get().player
        if (existing?.id === id) { set({ player: { ...existing, nickname } }); return }
        set({
          player: { id, nickname, coins: 300, badges: [], rating: 1000, unlockedModes: ['stage'] },
          inventory: { ...DEFAULT_INVENTORY },
          rankPoints: 0, scoreHistory: [],
          ownedSkins: ['skin_cipher'], equippedSkin: 'skin_cipher', equippedTitle: '',
        })
      },
      setPlayer:    (player) => set({ player }),
      addCoins:     (amount) => set(s => ({ player: s.player ? { ...s.player, coins: s.player.coins + amount } : null })),
      addBadge:     (badge) => set(s => {
        if (!s.player || s.player.badges.includes(badge)) return s
        return { player: { ...s.player, badges: [...s.player.badges, badge] } }
      }),
      updateRating: (delta) => set(s => ({ player: s.player ? { ...s.player, rating: Math.max(0, s.player.rating + delta) } : null })),
      unlockMode:   (mode) => set(s => {
        if (!s.player || s.player.unlockedModes.includes(mode)) return s
        return { player: { ...s.player, unlockedModes: [...s.player.unlockedModes, mode] } }
      }),
      clearPlayer: () => set({ player: null, inventory: { ...DEFAULT_INVENTORY }, rankPoints: 0, scoreHistory: [] }),

      // ── 랭킹 포인트 ───────────────────────────────────────
      addRankPoints: (rp, rec) => {
        set(s => {
          const record: ScoreRecord = { ...rec, id: `${Date.now()}-${Math.random().toString(36).slice(2,6)}`, rp, ts: Date.now() }
          const history = [record, ...s.scoreHistory].slice(0, 50)
          return { rankPoints: s.rankPoints + rp, scoreHistory: history }
        })
        // Firestore 비동기 동기화 (Firebase 설정 시)
        const player = get().player
        if (player) {
          // Supabase sync (no-op if not configured)
          import('@/lib/supabase').then(({ addRp }) =>
            addRp(player.id, rp, player.nickname).catch(() => {})
          )
        }
      },

      // ── 구매 ──────────────────────────────────────────────
      buyItem: (itemId, price, category, value = 1) => {
        const { player, ownedSkins, ownedTitles, ownedChallenges, inventory } = get()
        if (!player || player.coins < price) return false

        set(s => {
          const p = { ...s.player!, coins: s.player!.coins - price }
          if (category === 'skin')       return { player: p, ownedSkins:      [...ownedSkins, itemId] }
          if (category === 'title')      return { player: p, ownedTitles:     [...ownedTitles, itemId] }
          if (category === 'challenge')  return { player: p, ownedChallenges: [...ownedChallenges, itemId] }
          // 소모품
          const inv = { ...inventory }
          if (itemId === 'hint_x1' || itemId === 'hint_x3') inv.hints       += value
          if (itemId === 'time_extend')                      inv.timeExtends += value
          if (itemId === 'revive')                           inv.revives     += value
          return { player: p, inventory: inv }
        })
        return true
      },

      // ── 장착 ──────────────────────────────────────────────
      equipSkin: (skinId) => {
        const skin = getSkin(skinId)
        applyTheme(skin)
        set({ equippedSkin: skinId })
      },
      equipTitle:   (titleId) => set({ equippedTitle: titleId }),
      unequipTitle: () => set({ equippedTitle: '' }),

      // ── 소모품 사용 ────────────────────────────────────────
      useHint: () => {
        const { inventory } = get()
        if (inventory.hints <= 0) return false
        set(s => ({ inventory: { ...s.inventory, hints: s.inventory.hints - 1 } }))
        return true
      },
      useTimeExtend: () => {
        const { inventory } = get()
        if (inventory.timeExtends <= 0) return false
        set(s => ({ inventory: { ...s.inventory, timeExtends: s.inventory.timeExtends - 1 } }))
        return 45
      },
      useRevive: () => {
        const { inventory } = get()
        if (inventory.revives <= 0) return false
        set(s => ({ inventory: { ...s.inventory, revives: s.inventory.revives - 1 } }))
        return true
      },
    }),
    {
      name: 'key-crack-player-v2',
      partialize: s => ({
        player: s.player,
        inventory: s.inventory,
        ownedSkins: s.ownedSkins,
        ownedTitles: s.ownedTitles,
        ownedChallenges: s.ownedChallenges,
        equippedSkin: s.equippedSkin,
        equippedTitle: s.equippedTitle,
        rankPoints: s.rankPoints,
        scoreHistory: s.scoreHistory,
      }),
      // 로드 후 테마 재적용
      onRehydrateStorage: () => (state) => {
        if (state?.equippedSkin) applyTheme(getSkin(state.equippedSkin))
      },
    },
  ),
)

// ─── 셀렉터 ───────────────────────────────────────────────────────────────────
export const selectCoins        = (s: PlayerState) => s.player?.coins ?? 0
export const selectRating       = (s: PlayerState) => s.player?.rating ?? 1000
export const selectIsLoggedIn   = (s: PlayerState) => s.player !== null
export const selectInventory    = (s: PlayerState) => s.inventory
export const selectEquippedSkin = (s: PlayerState) => getSkin(s.equippedSkin)
export const selectDisplayName  = (s: PlayerState) => {
  const title = s.equippedTitle
    ? AGENT_SKINS.find(()=>true) && s.equippedTitle   // title label
    : ''
  return title ? `${title} ${s.player?.nickname ?? ''}` : (s.player?.nickname ?? '')
}
export const selectCanPlayMode  = (mode: GameMode) => (s: PlayerState) =>
  s.player?.unlockedModes.includes(mode) ?? false
