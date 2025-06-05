import { io } from 'socket.io-client'

const token = localStorage.getItem('token')
const socket = io('http://localhost:3000', {
  transports: ['websocket', 'polling'],
  query: token ? { token } : {},
})

export default socket
