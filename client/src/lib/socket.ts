import { io, Socket } from 'socket.io-client'

let _socket: Socket | null = null

const SERVER_URL = import.meta.env.VITE_SERVER_URL ?? '/'

export function getSocket(): Socket {
  if (!_socket) {
    _socket = io(SERVER_URL, {
      path: '/socket.io',
      autoConnect: false,
      transports: ['websocket'],
    })
  }
  return _socket
}

export function connectSocket(): Socket {
  const s = getSocket()
  if (!s.connected) s.connect()
  return s
}

export function disconnectSocket(): void {
  _socket?.disconnect()
  _socket = null
}
