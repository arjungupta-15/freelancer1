import { Server } from "socket.io";
import express from "express";
import http from "http";

const app = express();

const server = http.createServer(app);

// Corrected CORS origin (removed trailing slash)
const io = new Server(server, {
    cors: {
        origin: 'http://localhost:5177', // Make sure no trailing slash is there
        methods: ['GET', 'POST'],
        credentials: true // Optional: Allow cookies/credentials if needed
    }
});

const userSocketMap = {}; // This map stores socket id corresponding to the user id; userId -> socketId

export const getReceiverSocketId = (receiverId) => userSocketMap[receiverId];

io.on('connection', (socket) => {
    const userId = socket.handshake.query.userId;
    if (userId) {
        userSocketMap[userId] = socket.id;
    }

    // Emit the list of online users
    io.emit('getOnlineUsers', Object.keys(userSocketMap));

    // Handle disconnection and cleanup
    socket.on('disconnect', () => {
        if (userId) {
            delete userSocketMap[userId];
        }
        io.emit('getOnlineUsers', Object.keys(userSocketMap));
    });
});

export { app, server, io };
