import { create } from 'zustand'
import type { BattleRoom, BattlePlayer, SkillType, RSAPuzzle } from '@/types'
import { getSocket } from '@/lib/socket'

// ─── Socket 이벤트 페이로드 타입 ───────────────────────────────────────────────

interface RoundResult {
  playerId: string
  timeTaken: number
  correct: boolean
  score: number
}

interface FinalRank {
  playerId: string
  nickname: string
  totalScore: number
  rank: number
}

// ─── 타입 ──────────────────────────────────────────────────────────────────────

interface BattleState {
  room:         BattleRoom | null
  myId:         string | null
  roundResults: RoundResult[]
  finalRanking: FinalRank[]
  isConnecting: boolean
  error:        string | null
}

interface BattleActions {
  /** 매치메이킹 대기열 참가 */
  joinQueue: (nickname: string) => void

  /** 방 나가기 */
  leaveRoom: () => void

  /** Ready 상태 전송 */
  setReady: () => void

  /** 풀이 완료 제출 */
  submitRound: (answer: number, timeTaken: number) => void

  /** 스킬 사용 */
  useSkill: (skill: SkillType, targetId: string) => void

  /** 진행 단계 브로드캐스트 */
  broadcastProgress: (step: 1 | 2 | 3 | 4) => void

  // ── 서버 이벤트 수신 핸들러 (내부용) ──────────────────────────────────────
  _setRoom:              (room: BattleRoom | null) => void
  _setMyId:              (id: string) => void
  _updateOpponentStep:   (playerId: string, step: number) => void
  _applySkillReceived:   (skill: SkillType, fromId: string) => void
  _setRoundResults:      (results: RoundResult[]) => void
  _setFinalRanking:      (ranking: FinalRank[]) => void
  _setError:             (msg: string | null) => void

  /** Socket 이벤트 리스너 등록 (BattleModePage 마운트 시 1회 호출) */
  initSocketListeners: () => () => void  // 반환값: cleanup 함수
}

// ─── Store ─────────────────────────────────────────────────────────────────────

export const useBattleStore = create<BattleState & BattleActions>()((set, get) => ({
  room:         null,
  myId:         null,
  roundResults: [],
  finalRanking: [],
  isConnecting: false,
  error:        null,

  // ── 액션 ──────────────────────────────────────────────────────────────────

  joinQueue: (nickname) => {
    const socket = getSocket()
    if (!socket.connected) socket.connect()
    set({ isConnecting: true, error: null })
    socket.emit('battle:join', { nickname })
  },

  leaveRoom: () => {
    const { room } = get()
    if (room) getSocket().emit('battle:leave', { roomId: room.roomId })
    set({ room: null, myId: null, roundResults: [], finalRanking: [], isConnecting: false })
    getSocket().disconnect()
  },

  setReady: () => {
    const { room } = get()
    if (room) getSocket().emit('battle:ready', { roomId: room.roomId })
  },

  submitRound: (answer, timeTaken) => {
    const { room } = get()
    if (!room) return
    getSocket().emit('battle:submit', {
      roomId:    room.roomId,
      round:     room.currentRound,
      answer,
      timeTaken,
    })
  },

  useSkill: (skill, targetId) => {
    const { room } = get()
    if (!room) return
    getSocket().emit('battle:skill', { roomId: room.roomId, skill, targetId })
  },

  broadcastProgress: (step) => {
    const { room } = get()
    if (!room) return
    getSocket().emit('battle:progress', { roomId: room.roomId, step })
  },

  // ── 내부 세터 ─────────────────────────────────────────────────────────────

  _setRoom: (room) => set({ room, isConnecting: false }),

  _setMyId: (id) => set({ myId: id }),

  _updateOpponentStep: (playerId, step) =>
    set(s => {
      if (!s.room) return s
      return {
        room: {
          ...s.room,
          players: s.room.players.map(p =>
            p.id === playerId
              ? { ...p, currentStep: step as BattlePlayer['currentStep'] }
              : p,
          ),
        },
      }
    }),

  _applySkillReceived: (skill, _fromId) => {
    // 실제 효과는 Phase 7에서 TimerBar / HintPanel 연동
    // 여기서는 room 상태만 마킹
    console.log(`[battle] skill received: ${skill}`)
  },

  _setRoundResults: (results) => set({ roundResults: results }),

  _setFinalRanking: (ranking) => set({ finalRanking: ranking }),

  _setError: (msg) => set({ error: msg }),

  // ── Socket 이벤트 리스너 등록 ─────────────────────────────────────────────

  initSocketListeners: () => {
    const socket = getSocket()
    const store  = get()

    const onRoomUpdate    = (room: BattleRoom)        => store._setRoom(room)
    const onRoundStart    = (data: { puzzle: RSAPuzzle; round: number }) =>
      set(s => ({
        room: s.room
          ? { ...s.room, puzzle: data.puzzle, currentRound: data.round, status: 'in_round' }
          : null,
      }))
    const onRoundEnd      = (results: RoundResult[])  => store._setRoundResults(results)
    const onGameOver      = (ranking: FinalRank[])    => {
      store._setFinalRanking(ranking)
      set(s => ({ room: s.room ? { ...s.room, status: 'game_over' } : null }))
    }
    const onOppProgress   = (data: { playerId: string; step: number }) =>
      store._updateOpponentStep(data.playerId, data.step)
    const onSkillReceived = (data: { skill: SkillType; fromId: string }) =>
      store._applySkillReceived(data.skill, data.fromId)
    const onAssignId      = (id: string)              => store._setMyId(id)
    const onError         = (msg: string)             => store._setError(msg)

    socket.on('battle:room_update',       onRoomUpdate)
    socket.on('battle:round_start',       onRoundStart)
    socket.on('battle:round_end',         onRoundEnd)
    socket.on('battle:game_over',         onGameOver)
    socket.on('battle:opponent_progress', onOppProgress)
    socket.on('battle:skill_received',    onSkillReceived)
    socket.on('battle:assign_id',         onAssignId)
    socket.on('battle:error',             onError)

    // cleanup 함수 반환
    return () => {
      socket.off('battle:room_update',       onRoomUpdate)
      socket.off('battle:round_start',       onRoundStart)
      socket.off('battle:round_end',         onRoundEnd)
      socket.off('battle:game_over',         onGameOver)
      socket.off('battle:opponent_progress', onOppProgress)
      socket.off('battle:skill_received',    onSkillReceived)
      socket.off('battle:assign_id',         onAssignId)
      socket.off('battle:error',             onError)
    }
  },
}))

// ─── 셀렉터 헬퍼 ───────────────────────────────────────────────────────────────

export const selectMyPlayer = (s: BattleState) =>
  s.room?.players.find(p => p.id === s.myId) ?? null

export const selectOpponent = (s: BattleState) =>
  s.room?.players.find(p => p.id !== s.myId) ?? null

export const selectIsInBattle = (s: BattleState) =>
  s.room?.status === 'in_round'

export const selectCurrentRound = (s: BattleState) =>
  s.room?.currentRound ?? 0
