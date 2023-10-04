import { Server } from "http";

import db from "./utils/firestore";

import initSocketIO from "./utils/socket";

import SocketIO from "socket.io";

import jwt from "jsonwebtoken";

import * as firebase from "firebase-admin";

import { privateChatRequestMessage } from "./interface/privateChatMessageInterface";
import { room } from "./interface/roomInterface";

const chatUsers: any = {};

const initiateConnection = async (server: Server) => {
  try {
    const io: SocketIO.Server = await initSocketIO(server);

    io.use(authenticateSocket).on("connection", async (socket) => {
      const userId = socket.handshake.query.userId;

      const userName = socket.handshake.query.userName;

      const chatRoomSnapshot = await db.collection("chatRooms").where("participants","array-contains", userId).get();
      chatRoomSnapshot.docs.map((doc) => socket.join(doc.id));

      if (userId && userName) {
        chatUsers[socket.id] = { userId, userName };

        addUserToOnlineCollection(userId.toString(), userName.toString());

        io.emit("usersOnline", getOnlineUsers());
      }

      socket.on("room", (data: room) => handleRoom(io, socket, data));

      socket.on("privateChatMessage", (data: privateChatRequestMessage) => {
        handlePrivateChat(socket, data);
      });

      socket.on("fetchChats", () => {
        fetchUsersChat(chatUsers[socket.id].userId, socket);
      });

      socket.on("disconnect", () => handleDisconnect(io, socket));
    });

    return io;
  } catch (err) {
    console.log(err);
    throw err;
  }
};

const addUserToOnlineCollection = (userId: string, userName: string) => {
  db.collection("usersOnline").doc(userId).set({ online: true, userName });
};

const getOnlineUsers = async () => {
  const snapshot = await db.collection("usersOnline").get();

  const onlineUsers = snapshot.docs.map((doc) => ({
    userId: doc.id,

    userName: doc.data().userName,
  }));

  return onlineUsers;
};

const fetchUsersChat = async (userId: string, socket: SocketIO.Socket) => {
  const [privateChatsSnapshot, chatRoomsSnapshot] = await Promise.all([
    db
      .collection("privateChats")
      .where("participants", "array-contains", userId)
      .get(),
    db
      .collection("chatRooms")
      .where("participants", "array-contains", userId)
      .get(),
  ]);
  const privateChats = privateChatsSnapshot.docs.map((doc) => doc.data());
  const chatRoomChats = chatRoomsSnapshot.docs.map((doc) => doc.data());
  const mergedChats = [...privateChats, ...chatRoomChats];
  mergedChats.sort((a, b) => b.updatedAt.toMillis() - a.updatedAt.toMillis());
  socket.emit("fetchChats", mergedChats);
};

const handlePrivateChat = async (
  socket: SocketIO.Socket,
  data: privateChatRequestMessage
) => {
  const { receiverId, message } = data;
  const senderId = chatUsers[socket.id].userId;
  const participants = [senderId, receiverId].sort();
  const privateChatId = participants.join("-");

  const privateChatRef = db.collection("privateChats").doc(privateChatId);
  const privateChatSnapshot = await privateChatRef.get();
  if (!privateChatSnapshot.exists)
    await privateChatRef.set({
      updatedAt: new Date(),
      participants,
      messages: firebase.firestore.FieldValue.arrayUnion({
        userName: chatUsers[socket.id].userName,
        content: message,
        timestamp: new Date(),
      }),
    });
  else
    await privateChatRef.update({
      updatedAt: new Date(),
      participants,
      messages: firebase.firestore.FieldValue.arrayUnion({
        userName: chatUsers[socket.id].userName,
        content: message,
        timestamp: new Date(),
      }),
    });

  const recipientId = Object.keys(chatUsers).find(
    (key) => chatUsers[key].userId === receiverId
  );

  // broadcast message

  socket.emit(
    "privateChatMessage",
    `${chatUsers[socket.id].userName}:${message}`
  );

  if (recipientId)
    socket
      .to(recipientId)
      .emit(
        "privateChatMessage",
        `${chatUsers[socket.id].userName}:${message}`
      );
};

const handleRoom = async (
  io: SocketIO.Server,
  socket: SocketIO.Socket,
  data: room
) => {
  const { room, action, message } = data;
  const participant = chatUsers[socket.id].userId;
  const chatRoomRef = db.collection("chatRooms").doc(room);
  if (action === "join") {
    const chatRoomSnapshot = await chatRoomRef.get();
    if (!chatRoomSnapshot.exists) {
      await chatRoomRef.set({
        updatedAt: new Date(),
        participants: [participant],
        messages: [],
      });
    } else {
      await chatRoomRef.update({
        participants: firebase.firestore.FieldValue.arrayUnion(participant),
      });
    }
    socket.join(room);
    socket
      .to(room)
      .emit("room", `${chatUsers[socket.id].userName} joined room`);
  } else if (action === "leave") {
    await socket.leave(room);
    socket
      .to(room)
      .emit("room", `${chatUsers[socket.id].userName} left room: ${room}`);
    await chatRoomRef.update({
      participants: firebase.firestore.FieldValue.arrayRemove(participant),
    });
  } else if (action === "send") {
    let participantExists = false;
    await chatRoomRef.get().then((doc)=>{
      participantExists = doc.data()?.participants.includes(participant) ? true : false
    })
    if (participantExists) {
      console.log("Received chat room message:", message);
      await chatRoomRef.update({
        updatedAt: new Date(),
        messages: firebase.firestore.FieldValue.arrayUnion({
          userName: chatUsers[socket.id].userName,
          content: message,
          timestamp: new Date(),
        }),
      });

      // broadcast message

      io.to(room).emit("room", `${chatUsers[socket.id].userName}:${message}`);
    }
  }
};

const handleDisconnect = async (
  io: SocketIO.Server,
  socket: SocketIO.Socket
) => {
  console.log("user disconnected");

  socket.on("disconnect", () => {
    delete chatUsers[socket.id];
  });
};

const authenticateSocket = (
  socket: SocketIO.Socket,
  next: (err?: any) => void
) => {
  const token = socket.handshake.headers.authorization;

  if (token) {
    try {
      let decodedToken = jwt.verify(token, `${process.env.JWT_SECRET_KEY}`);

      if (decodedToken) {
        next();
      } else {
        next(new Error("Unauthorized"));
      }
    } catch (error) {
      next(new Error("Authentication error"));
    }
  } else {
    next(new Error("Authorization token missing"));
  }
};

export default { initiateConnection };
