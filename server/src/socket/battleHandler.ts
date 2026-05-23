import type { Server, Socket } from 'socket.io'
import {
  registerPlayer, removePlayer, getPlayer,
  enqueue, dequeue, getRoom, setReady,
  startRound, handleSubmit, applySkill,
  getFinalRanking, closeRoom,
} from './roomManager'

function roomPayload(room: ReturnType<typeof getRoom>) {
  if (!room) return null
  return {
    roomId:       room.id,
    status:       room.status,
    currentRound: room.currentRound,
    totalRounds:  room.totalRounds,
    puzzle:       room.puzzle ? { ...room.puzzle, answer: undefined } : null,
    players:      [...room.players.values()].map(p => ({
      id:           p.socketId,
      nickname:     p.nickname,
      score:        p.score,
      currentStep:  p.step,
      skills:       ['fake_hint','time_cut','shield','bonus_hint'],
      skillCooldowns: p.cooldowns,
      isReady:      p.isReady,
    })),
  }
}

export function registerBattleHandlers(io: Server, socket: Socket) {

  /* 매칭 대기열 참가 */
  socket.on('battle:join', ({ nickname }: { nickname: string }) => {
    registerPlayer(socket.id, nickname || 'AGENT')
    socket.emit('battle:assign_id', socket.id)

    const room = enqueue(socket.id)
    if (room) {
      // 두 플레이어 모두 룸에 참가
      room.players.forEach(p => {
        io.to(p.socketId).socketsJoin(room.id)
        io.to(p.socketId).emit('battle:room_update', roomPayload(room))
      })
    }
  })

  /* 레디 */
  socket.on('battle:ready', ({ roomId }: { roomId: string }) => {
    const { allReady, room } = setReady(socket.id)
    if (!room) return
    io.to(room.id).emit('battle:room_update', roomPayload(room))

    if (allReady) {
      setTimeout(() => launchRound(io, room), 1000)
    }
  })

  /* 풀이 제출 */
  socket.on('battle:submit', ({
    roomId, answer, timeTaken,
  }: { roomId: string; answer: number; timeTaken: number }) => {
    const room = getRoom(roomId)
    if (!room || room.status !== 'in_round') return

    const result = handleSubmit(socket.id, roomId, answer, timeTaken)

    // 라운드 결과 브로드캐스트
    const results = [...room.players.values()].map(p => ({
      playerId: p.socketId,
      correct:  p.socketId === socket.id ? result.correct : false,
      score:    p.socketId === socket.id ? result.score : 0,
      timeTaken: p.socketId === socket.id ? timeTaken : 0,
    }))

    io.to(roomId).emit('battle:round_end', results)
    io.to(roomId).emit('battle:room_update', roomPayload(room))

    // 다음 라운드 or 게임 오버
    setTimeout(() => {
      if (room.currentRound >= room.totalRounds) {
        room.status = 'game_over'
        io.to(roomId).emit('battle:game_over', getFinalRanking(room))
        io.to(roomId).emit('battle:room_update', roomPayload(room))
        setTimeout(() => closeRoom(roomId), 30_000)
      } else {
        launchRound(io, room)
      }
    }, 4000)
  })

  /* 스킬 사용 */
  socket.on('battle:skill', ({
    roomId, skill, targetId,
  }: { roomId: string; skill: string; targetId: string }) => {
    const { blocked, effect } = applySkill(socket.id, targetId, skill as any)
    if (effect === 'on-cooldown') return

    if (!blocked && effect !== 'shield-self') {
      io.to(targetId).emit('battle:skill_received', { skill, fromId: socket.id })
    }
    // 업데이트된 룸 정보 전파
    const room = getRoom(roomId)
    if (room) io.to(roomId).emit('battle:room_update', roomPayload(room))
  })

  /* 진행도 브로드캐스트 */
  socket.on('battle:progress', ({ roomId, step }: { roomId: string; step: number }) => {
    const player = getPlayer(socket.id)
    if (player) player.step = step as any
    socket.to(roomId).emit('battle:opponent_progress', { playerId: socket.id, step })
  })

  /* 나가기 */
  socket.on('battle:leave', ({ roomId }: { roomId: string }) => {
    cleanupPlayer(io, socket.id, roomId)
  })

  /* 연결 끊김 */
  socket.on('disconnect', () => {
    const player = getPlayer(socket.id)
    if (player?.roomId) cleanupPlayer(io, socket.id, player.roomId)
    dequeue(socket.id)
    removePlayer(socket.id)
  })
}

function launchRound(
  io: Server,
  room: ReturnType<typeof getRoom>,
) {
  if (!room) return
  const puzzle = startRound(room)
  const clientPuzzle = { ...puzzle, answer: undefined }

  io.to(room.id).emit('battle:round_start', {
    puzzle: clientPuzzle,
    round:  room.currentRound,
  })
  io.to(room.id).emit('battle:room_update', roomPayload(room))

  // 라운드 타임아웃 (최대 3분)
  const timeLimit = [null,null,180,120,90][room.currentRound - 1] ?? 120
  room.roundTimer = setTimeout(() => {
    if (room.status === 'in_round') {
      room.status = 'round_end'
      io.to(room.id).emit('battle:round_end', [])
      setTimeout(() => {
        if (room.currentRound >= room.totalRounds) {
          room.status = 'game_over'
          io.to(room.id).emit('battle:game_over', getFinalRanking(room))
        } else {
          launchRound(io, room)
        }
      }, 3000)
    }
  }, (timeLimit + 5) * 1000)
}

function cleanupPlayer(io: Server, socketId: string, roomId: string) {
  const room = getRoom(roomId)
  if (!room) return
  socket_leave(io, socketId, roomId)
  if (room.players.size <= 1) {
    closeRoom(roomId)
  }
}

function socket_leave(_io: Server, _sid: string, _roomId: string) {
  // socket이 이미 disconnect 중일 수 있으므로 조용히 처리
}
