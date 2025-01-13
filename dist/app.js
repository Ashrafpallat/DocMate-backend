"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const mongoose_1 = __importDefault(require("mongoose"));
const doctorRoutes_1 = __importDefault(require("./routes/doctorRoutes"));
const patientRoutes_1 = __importDefault(require("./routes/patientRoutes"));
const chatRoutes_1 = __importDefault(require("./routes/chatRoutes"));
const dotenv_1 = __importDefault(require("dotenv"));
const cors_1 = __importDefault(require("cors"));
const adminRoutes_1 = __importDefault(require("./routes/adminRoutes"));
const cookie_parser_1 = __importDefault(require("cookie-parser"));
const doctorModel_1 = require("./models/doctorModel");
const socket_io_1 = require("socket.io");
dotenv_1.default.config();
const app = (0, express_1.default)();
app.use((0, cookie_parser_1.default)());
app.use((0, cors_1.default)({
    origin: process.env.FRONTEND_URL,
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: true // Allow credentials (cookies) to be sent
}));
app.use(express_1.default.json());
app.use('/api/admin', adminRoutes_1.default);
app.use('/api/doctor', doctorRoutes_1.default);
app.use('/api/patient', patientRoutes_1.default);
app.use('/api/chat', chatRoutes_1.default);
// Connect to MongoDB
mongoose_1.default
    .connect(process.env.MONGO_URI)
    .then(() => console.log('MongoDB connected'))
    .catch(err => console.log('MongoDB connection error', err));
// Create the index (this will create the index on the existing documents)
doctorModel_1.Doctor.init().then(() => {
    // console.log('Geospatial index created!');
}).catch(err => {
    console.error('Error creating index:', err);
});
// Start the server 
const PORT = process.env.PORT || 5000;
const server = app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
const io = new socket_io_1.Server(server, {
    pingTimeout: 6000,
    cors: {
        origin: process.env.FRONTEND_URL,
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
