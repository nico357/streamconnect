const { createServer } = require('http');
const { parse } = require('url');
const next = require('next');
const { Server } = require('socket.io');

const dev = process.env.NODE_ENV !== 'production';
const app = next({ dev });
const handle = app.getRequestHandler();

app.prepare().then(() => {
  const server = createServer((req, res) => {
    const parsedUrl = parse(req.url, true);
    handle(req, res, parsedUrl);
  });

  const io = new Server(server);

  io.on('connection', (socket) => {
    console.log('New client connected');

    socket.on('join-stream', (streamId) => {
      socket.join(streamId);
      console.log(`Client joined stream: ${streamId}`);
    });

    socket.on('leave-stream', (streamId) => {
      socket.leave(streamId);
      console.log(`Client left stream: ${streamId}`);
    });

    socket.on('send-message', (msg) => {
      console.log(`New message in stream ${msg.streamId}: ${msg.content}`);
      io.to(msg.streamId).emit('new-message', msg);
    });

    socket.on('delete-message', (data) => {
      console.log(`Message deleted in stream ${data.streamId}: ${data.msgId}`);
      io.to(data.streamId).emit('message-deleted', data.msgId);
    });

    socket.on('mute-user', (data) => {
      console.log(`User muted in stream ${data.streamId}: ${data.userId}`);
      io.to(data.streamId).emit('user-muted', data.userId);
    });

    socket.on('request-collaboration', (data) => {
      console.log(`Collaboration requested in stream ${data.streamId} by user ${data.userId}`);
      io.to(data.streamId).emit('collaboration-requested', data.userId);
    });

    socket.on('approve-collaboration', (data) => {
      console.log(`Collaboration approved in stream ${data.streamId} for user ${data.userId}`);
      io.to(data.streamId).emit('collaboration-approved', data.userId);
    });

    socket.on('end-collaboration', (data) => {
      console.log(`Collaboration ended in stream ${data.streamId} for user ${data.userId}`);
      io.to(data.streamId).emit('collaboration-ended', data.userId);
    });

    socket.on('disconnect', () => {
      console.log('Client disconnected');
    });
  });

  const PORT = process.env.PORT || 3000;
  server.listen(PORT, (err) => {
    if (err) throw err;
    console.log(`> Ready on http://localhost:${PORT}`);
  });
});
