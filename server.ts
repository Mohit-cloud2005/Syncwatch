import express from "express";
import { createServer } from "http";
import { Server } from "socket.io";
import { createServer as createViteServer } from "vite";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function startServer() {
  const app = express();
  const httpServer = createServer(app);
  const io = new Server(httpServer, {
    cors: {
      origin: "*",
      methods: ["GET", "POST"],
    },
  });

  const PORT = 3000;

  // In-memory room state
  const rooms: Record<string, {
    host: string;
    videoState: {
      videoId: string;
      currentTime: number;
      playing: boolean;
      lastUpdate: number;
    };
    queue: string[];
    users: { id: string; name: string; photo: string }[];
  }> = {};

  io.on("connection", (socket) => {
    console.log("User connected:", socket.id);

    socket.on("join-room", ({ roomId, user }) => {
      socket.join(roomId);
      
      if (!rooms[roomId]) {
        rooms[roomId] = {
          host: socket.id,
          videoState: {
            videoId: "dQw4w9WgXcQ", // Default video
            currentTime: 0,
            playing: false,
            lastUpdate: Date.now(),
          },
          queue: [],
          users: [],
        };
      }

      // Add user to room list
      const room = rooms[roomId];
      if (!room.users.find(u => u.id === socket.id)) {
        room.users.push({ ...user, id: socket.id });
      }

      // Send current state to the new user
      socket.emit("room-state", room);
      
      // Notify others
      socket.to(roomId).emit("user-joined", { ...user, id: socket.id });
      
      console.log(`User ${socket.id} joined room ${roomId}`);
    });

    socket.on("video-state-change", ({ roomId, state }) => {
      const room = rooms[roomId];
      if (room && room.host === socket.id) {
        room.videoState = { ...state, lastUpdate: Date.now() };
        io.to(roomId).emit("video-state-update", room.videoState);
      }
    });

    socket.on("chat-message", ({ roomId, message }) => {
      io.to(roomId).emit("chat-message", {
        ...message,
        id: Math.random().toString(36).substr(2, 9),
        timestamp: Date.now(),
      });
    });

    socket.on("reaction", ({ roomId, reaction }) => {
      io.to(roomId).emit("reaction", reaction);
    });

    socket.on("add-to-queue", ({ roomId, videoId }) => {
      const room = rooms[roomId];
      if (room) {
        room.queue.push(videoId);
        io.to(roomId).emit("queue-updated", room.queue);
      }
    });

    socket.on("remove-from-queue", ({ roomId, index }) => {
      const room = rooms[roomId];
      if (room) {
        room.queue.splice(index, 1);
        io.to(roomId).emit("queue-updated", room.queue);
      }
    });

    socket.on("change-video", ({ roomId, videoId }) => {
      const room = rooms[roomId];
      if (room && room.host === socket.id) {
        room.videoState.videoId = videoId;
        room.videoState.currentTime = 0;
        room.videoState.playing = true;
        room.videoState.lastUpdate = Date.now();
        io.to(roomId).emit("video-changed", room.videoState);
      }
    });

    socket.on("transfer-host", ({ roomId, newHostId }) => {
      const room = rooms[roomId];
      if (room && room.host === socket.id) {
        room.host = newHostId;
        io.to(roomId).emit("host-updated", newHostId);
      }
    });

    socket.on("disconnecting", () => {
      for (const roomId of socket.rooms) {
        if (rooms[roomId]) {
          const room = rooms[roomId];
          room.users = room.users.filter(u => u.id !== socket.id);
          
          if (room.host === socket.id) {
            // Transfer host to someone else if available
            if (room.users.length > 0) {
              room.host = room.users[0].id;
              io.to(roomId).emit("host-updated", room.host);
            } else {
              // Delete room if empty
              delete rooms[roomId];
            }
          }
          
          io.to(roomId).emit("user-left", socket.id);
        }
      }
    });

    socket.on("disconnect", () => {
      console.log("User disconnected:", socket.id);
    });
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  httpServer.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
