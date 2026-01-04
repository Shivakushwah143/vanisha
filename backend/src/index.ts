

import { WebSocketServer, WebSocket } from "ws";
import express from "express";
import cors from "cors";
import http from "http";

const app = express();
app.use(cors());

const server = http.createServer(app);
const ws = new WebSocketServer({ server });

app.get("/ping", (req, res) => {
  res.status(200).send("Server is alive");
});

interface User {
  socket: WebSocket;
  roomId: string;
  userId: string;
  username: string;
}

let userCount: number = 0;
let allSockets: User[] = [];

// Generate random usernames
const adjectives = ["Cool", "Swift", "Silent", "Mystic", "Quick", "Bright", "Dark", "Happy"];
const nouns = ["Tiger", "Phoenix", "Wolf", "Owl", "Fox", "Eagle", "Dragon", "Lion"];

function generateRandomUsername(): string {
  const adj = adjectives[Math.floor(Math.random() * adjectives.length)];
  const noun = nouns[Math.floor(Math.random() * nouns.length)];
  const number = Math.floor(Math.random() * 999) + 1;
  return `${adj}${noun}${number}`;
}

function generateUserId(): string {
  return `user_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

ws.on("connection", function connection(socket: WebSocket) {
  console.log("user connected");
  userCount++;
  console.log("User count:", userCount);

  socket.on("message", (message) => {
    try {
      const parsedMessage = JSON.parse(message.toString());

      if (parsedMessage.type === "join") {
        const userId = parsedMessage.payload.senderId || generateUserId();
        const username = parsedMessage.payload.username || generateRandomUsername();
        
        // Store user
        allSockets.push({ 
          socket, 
          roomId: parsedMessage.payload.roomId,
          userId: userId,
          username: username
        });

        // Send welcome with username (only to this user)
        socket.send(JSON.stringify({
          type: "welcome",
          payload: {
            username: username,
            userId: userId
          }
        }));

        // Notify others in the room (excluding this user)
        const systemMessage = JSON.stringify({
          type: "system",
          message: `${username} joined the chat`,
          timestamp: Date.now()
        });

        allSockets.forEach((user) => {
          if (user.roomId === parsedMessage.payload.roomId && user.socket !== socket) {
            user.socket.send(systemMessage);
          }
        });
      }

      if (parsedMessage.type === "chat") {
        const currentUser = allSockets.find((x) => x.socket === socket);
        
        if (currentUser) {
          const messageWithSender = JSON.stringify({
            type: "message",
            message: parsedMessage.payload.message,
            sender: currentUser.username,
            senderId: currentUser.userId,
            timestamp: Date.now()
          });

          // Send to ALL OTHER users in the room (EXCLUDING sender)
          allSockets.forEach((user) => {
            if (user.roomId === currentUser.roomId && user.socket !== socket) {
              user.socket.send(messageWithSender);
            }
          });
        }
      }

      if (parsedMessage.type === "username") {
        const currentUser = allSockets.find((x) => x.socket === socket);
        if (currentUser && parsedMessage.payload.username) {
          const oldName = currentUser.username;
          currentUser.username = parsedMessage.payload.username;
          
          // Notify all users in the room
          const systemMessage = JSON.stringify({
            type: "system",
            message: `${oldName} is now ${currentUser.username}`,
            timestamp: Date.now()
          });

          allSockets.forEach((user) => {
            if (user.roomId === currentUser.roomId) {
              user.socket.send(systemMessage);
            }
          });
        }
      }
    } catch (error) {
      console.error("Error parsing message:", error);
    }
  });

  socket.on("close", () => {
    console.log("user disconnected");
    // Remove user from allSockets
    const disconnectedUser = allSockets.find((x) => x.socket === socket);
    if (disconnectedUser) {
      // Notify others in the room (excluding disconnected user)
      const systemMessage = JSON.stringify({
        type: "system",
        message: `${disconnectedUser.username} left the chat`,
        timestamp: Date.now()
      });

      allSockets.forEach((user) => {
        if (user.roomId === disconnectedUser.roomId && user.socket !== socket) {
          user.socket.send(systemMessage);
        }
      });
    }
    
    allSockets = allSockets.filter((user) => user.socket !== socket);
    userCount--;
    console.log("User count:", userCount);
  });

  socket.on("error", (error) => {
    console.error("WebSocket error:", error);
  });
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});