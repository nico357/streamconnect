import { Server } from 'socket.io'
import type { NextApiRequest } from 'next'
import type { Socket as NetSocket } from 'net'
import type { Server as HTTPServer } from 'http'

interface SocketServer extends HTTPServer {
  io?: Server | undefined
}

interface SocketWithIO extends NetSocket {
  server: SocketServer
}

interface NextApiResponseWithSocket extends NextApiRequest {
  socket: SocketWithIO
}

const SocketHandler = (req: NextApiRequest, res: NextApiResponseWithSocket) => {
  if (res.socket.server.io) {
    console.log('Socket is already running')
  } else {
    console.log('Socket is initializing')
    const io = new Server(res.socket.server)
    res.socket.server.io = io

    io.on('connection', socket => {
      console.log('New client connected')

      socket.on('join-stream', (streamId) => {
        socket.join(streamId)
        console.log(`Client joined stream: ${streamId}`)
      })

      socket.on('leave-stream', (streamId) => {
        socket.leave(streamId)
        console.log(`Client left stream: ${streamId}`)
      })

      socket.on('send-message', (msg) => {
        io.to(msg.streamId).emit('new-message', msg)
      })

      socket.on('delete-message', (data) => {
        io.to(data.streamId).emit('message-deleted', data.msgId)
      })

      socket.on('mute-user', (data) => {
        io.to(data.streamId).emit('user-muted', data.userId)
      })

      socket.on('request-collaboration', (data) => {
        io.to(data.streamId).emit('collaboration-requested', data.userId)
      })

      socket.on('approve-collaboration', (data) => {
        io.to(data.streamId).emit('collaboration-approved', data.userId)
      })

      socket.on('end-collaboration', (data) => {
        io.to(data.streamId).emit('collaboration-ended', data.userId)
      })

      socket.on('disconnect', () => {
        console.log('Client disconnected')
      })
    })
  }
  res.end()
}

export default SocketHandler