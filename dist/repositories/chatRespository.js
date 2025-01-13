"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.chatRepository = void 0;
const ChatModel_1 = require("../models/ChatModel"); // Import the actual Chat model
const patientModel_1 = require("../models/patientModel");
const doctorModel_1 = require("../models/doctorModel");
const MessageModel_1 = require("../models/MessageModel");
class ChatRepository {
    fetchChatsByUserId(userId, userRole) {
        return __awaiter(this, void 0, void 0, function* () {
            const query = {
                $or: [{ patient: userId }, { doctor: userId }],
            };
            const chats = yield ChatModel_1.Chat.find(query)
                .sort({ updatedAt: -1 })
                .populate(userRole === 'patient' ? 'doctor' : 'patient', 'name profilePhoto')
                .populate('lastMessage', 'content sender createdAt');
            return chats;
        });
    }
    // Fetch or create a chat by patient and doctor IDs
    fetchOrCreateChat(user1, user2) {
        return __awaiter(this, void 0, void 0, function* () {
            let patient = yield patientModel_1.Patient.findById(user1);
            let doctor = yield doctorModel_1.Doctor.findById(user2);
            if (!patient) {
                patient = yield patientModel_1.Patient.findById(user2);
                doctor = yield doctorModel_1.Doctor.findById(user1);
            }
            if (!patient) {
                throw new Error("Neither user1 nor user2 is a valid patient");
            }
            if (!doctor) {
                throw new Error("Doctor not found");
            }
            let chat = yield ChatModel_1.Chat.findOne({
                patient: patient._id,
                doctor: doctor._id,
            }).populate({
                path: "lastMessage", // Populate the lastMessage field
                populate: {
                    path: "sender", // Nested populate to get sender details
                    select: "name profilePhoto", // Select only necessary fields
                },
            });
            if (!chat) {
                chat = yield ChatModel_1.Chat.create({
                    patient: patient._id,
                    doctor: doctor._id,
                });
                chat = yield ChatModel_1.Chat.findById(chat._id).populate({
                    path: "lastMessage",
                    populate: {
                        path: "sender",
                        select: "name profilePhoto",
                    },
                });
                if (!chat) {
                    throw new Error("Chat not found after creation");
                }
            }
            return chat;
        });
    }
    sendMessage(chatId, sender, senderRole, receiver, content) {
        return __awaiter(this, void 0, void 0, function* () {
            const newMessage = {
                chatId,
                sender,
                senderRole,
                receiver,
                content
            };
            const message = yield MessageModel_1.Message.create(newMessage);
            yield ChatModel_1.Chat.findByIdAndUpdate(chatId, {
                lastMessage: message._id,
                lastMessageTime: new Date(),
            });
            return message;
        });
    }
    getMessages(chatId) {
        return __awaiter(this, void 0, void 0, function* () {
            // Fetch messages and update their 'read' status to true
            const messages = yield MessageModel_1.Message.find({ chatId })
                .populate({
                path: "sender",
                select: "name profilePhoto",
            });
            // Update all unread messages to read
            yield MessageModel_1.Message.updateMany({ chatId, read: false }, // Only update unread messages
            { $set: { read: true } } // Set read field to true
            );
            return messages;
        });
    }
    getUnreadMessageCount(userId, chatId) {
        return __awaiter(this, void 0, void 0, function* () {
            const unreadCount = yield MessageModel_1.Message.countDocuments({
                receiver: userId,
                chatId: chatId,
                read: false,
            });
            return unreadCount;
        });
    }
}
exports.chatRepository = new ChatRepository();
