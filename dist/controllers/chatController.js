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
exports.chatController = void 0;
const chatService_1 = require("../services/chatService");
class ChatController {
    getUserChats(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            var _a, _b;
            try {
                const userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.userId;
                const userRole = (_b = req.user) === null || _b === void 0 ? void 0 : _b.role;
                if (!userId || !userRole) {
                    throw new Error("User ID or role is missing.");
                }
                const chats = yield chatService_1.chatService.getChatsForUser(userId, userRole);
                return res.status(200).json(chats);
            }
            catch (error) {
                console.error("Error fetching chats:", error);
                return res.status(500).json({ error: "Failed to fetch chats" });
            }
        });
    }
    fetchOrCreateChat(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            var _a;
            try {
                const { user1 } = req.body;
                const user2 = (_a = req.user) === null || _a === void 0 ? void 0 : _a.userId;
                const chat = yield chatService_1.chatService.getOrCreateChat(user1, user2);
                return res.status(200).json(chat);
            }
            catch (error) {
                console.error("Error fetching or creating chat:", error);
                return res.status(500).json({ error: "Failed to fetch or create chat" });
            }
        });
    }
    sendMessage(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            var _a, _b;
            try {
                const sender = (_a = req.user) === null || _a === void 0 ? void 0 : _a.userId;
                const senderRole = (_b = req.user) === null || _b === void 0 ? void 0 : _b.role;
                const { chatId, receiver, content } = req.body;
                console.log('req.body', req.body);
                const message = yield chatService_1.chatService.sendMessage(chatId, sender, senderRole, receiver, content);
                return res.status(200).json(message);
            }
            catch (error) {
                console.log('error sending meesage controler', error);
            }
        });
    }
    getMessages(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const chatId = req.params.chatId;
                console.log('chatid from controler', chatId);
                const messages = yield chatService_1.chatService.getMessages(chatId);
                return res.status(200).json(messages);
            }
            catch (error) {
                console.log('error fetching messages', error);
            }
        });
    }
    getUnreadMessageCount(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            var _a;
            try {
                const userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.userId;
                const chatId = req.params.chatId;
                if (!userId || !chatId) {
                    throw new Error('UserId or ChatId is missing');
                }
                const unreadMessageCount = yield chatService_1.chatService.getUnreadMessageCount(userId, chatId);
                return res.status(200).json(unreadMessageCount);
            }
            catch (error) {
                console.log('error fetching unreadmessage count countroller', error);
            }
        });
    }
}
;
exports.chatController = new ChatController();
