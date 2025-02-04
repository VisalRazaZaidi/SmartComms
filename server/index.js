import express from 'express'; // for building web applications and APIs
import { connectDB } from './utils/features.js'; // for connecting to the mongodb database
import dotenv from 'dotenv'; //module to load environment variables
import { errorMiddleware } from './middlewares/error.js'; //custom middlewares for handling errors
import cookieParser from 'cookie-parser'; //middleware for parsing cookies attached to the client object
import { Server } from 'socket.io'; // for real time , bidirectional communication between web-clients and servers
import { createServer } from 'http'; //for creating http server and handling HTTP requests
import { v4 as uuid } from 'uuid'; // for generating universally unique identifiers
import cors from 'cors'; // middlewares for enabling Cross-Origin Resource Sharing
import { v2 as cloudinary } from 'cloudinary'; // module for interacting with cloudinary service
import {
  CHAT_JOINED,
  CHAT_LEAVED,
  NEW_MESSAGE,
  NEW_MESSAGE_ALERT,
  ONLINE_USERS,
  START_TYPING,
  STOP_TYPING,
} from './constants/events.js'; // constants
import { getSockets } from './lib/helper.js';
import { Message } from './models/message.js';
import { corsOptions } from './constants/config.js';
import { socketAuthenticator } from './middlewares/auth.js';

import userRoute from './routes/user.js';
import chatRoute from './routes/chat.js';
import adminRoute from './routes/admin.js';
import smartReplyRoute from './routes/smartReply.js';
import colors from 'colors';

//loading environment variables from the .env files
dotenv.config({
  path: './.env',
});

//configurations for the environment like db, port , envmode, admin secretkey
const mongoURI = process.env.MONGO_URI;
const port = process.env.PORT || 9091;
const envMode = process.env.NODE_ENV.trim() || 'PRODUCTION';
const adminSecretKey = process.env.ADMIN_SECRET_KEY || 'mayank1711';
const userSocketIDs = new Map(); // mapping userIds with their corresponding socketIDs
const onlineUsers = new Set(); // storing online users Ids

//function to establish connection with the mongodb database (cloud)
connectDB(mongoURI);

//cloudinary configurations
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

//creating an express application and http server
const app = express();
const server = createServer(app);

// Setting up smart Reply
app.use(express.json());

//creating an SocketIO server instance and configuring with corsOptions
const io = new Server(server, {
  cors: corsOptions,
});

//making SocketIO instance accessible throughout the application
app.set('io', io);

// Using Middlewares
app.use(express.json()); // handle json parsing
app.use(cookieParser()); // cookie parsing
app.use(cors(corsOptions)); // handle cors

// Register smartReply routes
app.use('/api/smart-reply', smartReplyRoute);

//route handlers
app.use('/api/v1/user', userRoute);
app.use('/api/v1/chat', chatRoute);
app.use('/api/v1/admin', adminRoute);

//default request or welcome to the server
app.get('/', (req, res) => {
  res.send('Welcome to MySocket');
});

//socketIO middleware to parse cookies and authenticate socket connections before processing events
io.use((socket, next) => {
  cookieParser()(
    socket.request,
    socket.request.res,
    async (err) => await socketAuthenticator(err, socket, next)
  );
});

io.on('connection', (socket) => {
  const user = socket.user;
  userSocketIDs.set(user._id.toString(), socket.id);

  // handles the event when a new message is received from the client
  socket.on(NEW_MESSAGE, async ({ chatId, members, message }) => {
    const messageForRealTime = {
      content: message,
      _id: uuid(),
      sender: {
        _id: user._id,
        name: user.name,
      },
      chat: chatId,
      createdAt: new Date().toISOString(),
    };

    const messageForDB = {
      content: message,
      sender: user._id,
      chat: chatId,
    };

    const membersSocket = getSockets(members);
    io.to(membersSocket).emit(NEW_MESSAGE, {
      chatId,
      message: messageForRealTime,
    });
    io.to(membersSocket).emit(NEW_MESSAGE_ALERT, { chatId });

    try {
      await Message.create(messageForDB);
    } catch (error) {
      throw new Error(error);
    }
  });

  // handles the event when user starts typing
  socket.on(START_TYPING, ({ members, chatId }) => {
    const membersSockets = getSockets(members);
    socket.to(membersSockets).emit(START_TYPING, { chatId });
  });

  // handles the event when user stops typing
  socket.on(STOP_TYPING, ({ members, chatId }) => {
    const membersSockets = getSockets(members);
    socket.to(membersSockets).emit(STOP_TYPING, { chatId });
  });

  // handles the event when user joined the chat
  socket.on(CHAT_JOINED, ({ userId, members }) => {
    onlineUsers.add(userId.toString());

    const membersSocket = getSockets(members);
    io.to(membersSocket).emit(ONLINE_USERS, Array.from(onlineUsers));
  });

  // handles the event when user leaves the chat
  socket.on(CHAT_LEAVED, ({ userId, members }) => {
    onlineUsers.delete(userId.toString());

    const membersSocket = getSockets(members);
    io.to(membersSocket).emit(ONLINE_USERS, Array.from(onlineUsers));
  });

  // handles the event when a client disconnects from the server
  socket.on('disconnect', () => {
    userSocketIDs.delete(user._id.toString());
    onlineUsers.delete(user._id.toString());
    socket.broadcast.emit(ONLINE_USERS, Array.from(onlineUsers));
  });
});

//custom error middlewares
app.use(errorMiddleware);

//Starting the HTTP server to listen on the specified port
server.listen(port, () => {
  console.log(
    `Server is running on port ${port} in ${envMode} Mode`.bold.green
  );
});

export { envMode, adminSecretKey, userSocketIDs };
