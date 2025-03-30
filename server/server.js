const express = require('express');
const app = express();
const http = require('http');
const path = require('path');
const cors = require('cors');
const { Server } = require('socket.io');

const server = http.createServer(app);

// CORS Configuration
app.use(cors({
  origin: process.env.CLIENT_URL || "http://localhost:5173",
  methods: ["GET", "POST"]
}));

const io = new Server(server, {
  cors: {
    origin: "http://localhost:5173",
    methods: ["GET", "POST"]
  }
});

// Static files and SPA fallback
app.use(express.static(path.join(__dirname, 'dist'))); // Change 'build' to 'dist' if using Vite
app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'dist', 'index.html'));
});

const userSocketMap = new Map();
const roomCodeMap = new Map();

// Helper functions
const getAllClientsInRoom = (roomId) => {
  return Array.from(io.sockets.adapter.rooms.get(roomId) || []).map(socketId => ({
    socketId,
    username: userSocketMap.get(socketId)
  }));
};

const notifyRoom = (roomId, event, data) => {
  io.to(roomId).emit(event, data);
};

// Socket.IO Logic
io.on('connection', (socket) => {
  console.log('Socket connected:', socket.id);

  // Join Room Handler
  socket.on('join-room', ({ roomId, username }) => {
    try {
      userSocketMap.set(socket.id, username);
      socket.join(roomId);

      // Initialize room code if empty
      if (!roomCodeMap.has(roomId)) {
        roomCodeMap.set(roomId, '// Start coding here...');
      }

      // Send existing code to new user
      socket.emit('code-sync', {
        code: roomCodeMap.get(roomId)
      });

      // Notify all clients in room
      notifyRoom(roomId, 'user-joined', {
        clients: getAllClientsInRoom(roomId),
        newUser: username
      });

    } catch (error) {
      console.error('Join error:', error);
      socket.emit('error', { message: 'Failed to join room' });
    }
  });

  // Code Change Handler
  socket.on('code-change', ({ roomId, code }) => {
    try {
      roomCodeMap.set(roomId, code);
      socket.to(roomId).emit('code-update', { code });
    } catch (error) {
      console.error('Code update error:', error);
    }
  });

  // Disconnection Handler
  socket.on('disconnecting', () => {
    const rooms = Array.from(socket.rooms);
    rooms.forEach(roomId => {
      socket.to(roomId).emit('user-left', {
        socketId: socket.id,
        username: userSocketMap.get(socket.id)
      });
    });
    userSocketMap.delete(socket.id);
  });

  // Error Handling
  socket.on('error', (error) => {
    console.error('Socket error:', error);
  });
});

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => console.log(`Server running on port ${PORT}`));