import { Server, Socket } from "socket.io";
import http from "http";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";
import { addUser, getUser, removeUser } from "./usersMap";
import { Message } from "./types/custom";
import { Seen } from "./types/custom";
import { Notification } from "./types/custom";

dotenv.config();

interface VerifiedToken {
  id: number;
}

declare module "socket.io" {
  interface Socket {
    userId?: number;
  }
}

export default function setupSocket() {
  const server = http.createServer();

  const io = new Server(server, {
    cors: {
      origin: "*",
      methods: ["GET", "POST"],
      credentials: true,
    },
  });

  io.use((socket: Socket, next) => {
    const token = socket.handshake.auth.token;

    try {
      const decodedToken = jwt.verify(
        token,
        process.env.JWT_SECRET!
      ) as VerifiedToken;
      socket.userId = decodedToken.id;
      next();
    } catch (error) {
      console.log(error);
    }
  });

  io.on("connection", (socket: Socket) => {
    if (socket.userId) addUser(socket.userId, socket.id);

    console.log("User connected", socket.userId);

    socket.on(
      "sendMessage",
      ({ sender_id, receiverId, message, conversationId }: Message) => {
        const userSocketId = getUser(receiverId);

        if (!userSocketId) return;

        io.to(userSocketId).emit("getMessage", {
          conversation_id: conversationId,
          sender_id: sender_id,
          receiverId,
          message,
        });
      }
    );

    //send friend request
    socket.on("sendFriendRequest", async (requestInfo) => {
      const receiverSocketId = getUser(requestInfo.receiverId);

      if (!receiverSocketId) return;

      io.to(receiverSocketId).emit("getFriendRequest", requestInfo.senderInfo);
    });

    //send information when when user rejects friend request
    socket.on("rejectFriendRequest", (receiverId: number) => {
      const userSocketId = getUser(receiverId);
      const senderId = socket.userId;

      if (!userSocketId) return;

      io.to(userSocketId).emit("rejectedFriendRequest", senderId);
    });

    socket.on("acceptFriendRequest", async (requestInfo) => {
      const senderSocketId = getUser(socket.userId!);
      const receiverSocketId = getUser(requestInfo.receiverId);

      if (!senderSocketId || !receiverSocketId)
        return console.log("SocketId missing in acceptFriendReq");

      io.to(receiverSocketId).emit(
        "friendRequestAccepted",
        requestInfo.senderInfo
      );
    });

    //send information when user gets unfriended
    socket.on("removeFromFriends", (receiverId: number) => {
      const userSocketId = getUser(receiverId);
      const senderId = socket.userId;

      if (!userSocketId) return;

      io.to(userSocketId).emit("removedFromFriends", senderId);
    });

    //send information that message was seen
    socket.on("emitSeen", (data: Seen) => {
      const userSocketId = getUser(data.receiver_id);

      if (!userSocketId) return;

      io.to(userSocketId).emit("getSeen", data);
    });

    //send notification
    socket.on("sendNotification", (notification: Notification) => {
      const userSocketId = getUser(notification.receiver_id);

      if (!userSocketId) return;

      io.to(userSocketId).emit("getNotification", notification);
    });

    //when users disconnects
    socket.on("disconnect", () => {
      removeUser(socket.id);
    });
  });

  io.listen(8000);
}
