import { Server } from 'socket.io';
import { ChatMessage } from '../models/ChatMessage.js';

let ioInstance = null;

export function initSocket(server) {
  const isProd = process.env.NODE_ENV === 'production'
  const allowed = (process.env.CLIENT_ORIGIN && process.env.CLIENT_ORIGIN.split(',').map(s => s.trim()).filter(Boolean))
    || ['http://localhost:7000', 'http://localhost:7001', 'http://localhost:5173']
  ioInstance = new Server(server, {
    cors: {
      origin: (origin, callback) => {
        if (!origin) return callback(null, true) // non-browser clients
        if (!isProd) return callback(null, true) // allow all in dev
        if (allowed.includes(origin)) return callback(null, true)
        return callback(new Error('Not allowed by Socket.IO CORS'))
      },
      credentials: true,
      methods: ['GET', 'POST']
    },
  });

  ioInstance.on('connection', (socket) => {
    // Basic join room for chat or future hostel/floor channels
    socket.on('join', (room) => socket.join(room));

    // Minimal chat support: clients emit chat:join to join a room (e.g., 'support')
    socket.on('chat:join', (room) => {
      if (!room) return;
      socket.join(room);
      socket.emit('chat:system', { room, text: 'Joined room', ts: Date.now() });
    });

    // Persist and relay messages to everyone in room
    socket.on('chat:send', async ({ room, text, from, userId }) => {
      if (!room || !text) return;
      try {
        const doc = await ChatMessage.create({ room, text, from: from || 'guest', userId })
        const payload = { _id: doc._id, room: doc.room, text: doc.text, from: doc.from, ts: doc.createdAt?.getTime?.() || Date.now() }
        ioInstance.to(room).emit('chat:message', payload);
      } catch (e) {
        // swallow error to avoid crashing socket; optionally emit error
        socket.emit('chat:error', { message: 'Failed to send message' })
      }
    });

    // Typing indicator (transient, not persisted)
    socket.on('chat:typing', ({ room, from }) => {
      if (!room) return;
      socket.to(room).emit('chat:typing', { room, from, ts: Date.now() })
    })
  });

  return ioInstance;
}

export function io() {
  if (!ioInstance) throw new Error('Socket.io not initialized');
  return ioInstance;
}


