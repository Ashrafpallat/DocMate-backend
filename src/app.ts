import express from 'express';
import mongoose from 'mongoose';
import doctorRoutes from './routes/doctorRoutes';
import patientRoutes from './routes/patientRoutes';
import chatRoutes from './routes/ChatRoutes';
import dotenv from 'dotenv';
import cors from 'cors'
import adminRouter from './routes/adminRoutes';
import cookieParser from 'cookie-parser';
import { Doctor } from './models/doctorModel';
import { Server } from 'socket.io';
dotenv.config();

const app = express();
app.use(cookieParser());

app.use(cors({
  origin: process.env.FRONTEND_URL as string,
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true // Allow credentials (cookies) to be sent
}));
app.use(express.json());
 
app.use('/api/admin', adminRouter);
app.use('/api/doctor', doctorRoutes);
app.use('/api/patient', patientRoutes);
app.use('/api/chat', chatRoutes)

// Connect to MongoDB
mongoose
  .connect(process.env.MONGO_URI as string)
  .then(() => console.log('MongoDB connected'))
  .catch(err => console.log('MongoDB connection error', err));

// Create the index (this will create the index on the existing documents)
Doctor.init().then(() => {
  // console.log('Geospatial index created!');
}).catch(err => {
  console.error('Error creating index:', err);
});

// Start the server 
const PORT = process.env.PORT || 5000;
const server = app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

const io = new Server(server, {
  pingTimeout: 6000,
  cors: {
    origin: process.env.FRONTEND_URL as string,
    methods: ["GET", "POST"]
  }
});

io.on('connection', (socket) => {
  console.log('A user connected:', socket.id);

  // Join chat rooms
  socket.on('joinRoom', (chatId) => {
    socket.join(chatId);
    console.log(`User joined room: ${chatId}`);
  });

  socket.on('leaveRoom', (chatId) => {
    socket.leave(chatId);
    console.log(`User left room: ${chatId}`);
  });

  // Listen for a typing event
  socket.on('typing', (chatId) => {    
    socket.to(chatId).emit('typing', chatId); // Broadcast "typing" event to the room
  });

  // Listen for a stopTyping event
  socket.on('stopTyping', (chatId) => {    
    socket.to(chatId).emit('stopTyping', chatId); // Broadcast "stopTyping" event to the room
  });

  // Listen for a message from the client
  socket.on('sendMessage', (data) => {
    console.log('Message received:', data);

    // Broadcast the message to the specific chat room
    socket.to(data.chatId).emit('receiveMessage', data);
  });

  socket.on('video-call', (data) => {
    const { chatId, videoCallUrl } = data;
    // Broadcast the message to the specific chat room
    socket.to(data.chatId).emit('receiveVideoCall', data);
  });

  // Handle disconnection
  socket.on('disconnect', () => {
    console.log('User disconnected:', socket.id);
  });
});
