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
exports.chatService = void 0;
const chatRespository_1 = require("../repositories/chatRespository");
class ChatService {
    getChatsForUser(userId, userRole) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield chatRespository_1.chatRepository.fetchChatsByUserId(userId, userRole);
        });
    }
    getOrCreateChat(user1, user2) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield chatRespository_1.chatRepository.fetchOrCreateChat(user1, user2);
        });
    }
    sendMessage(chatId, sender, senderRole, receiver, content) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield chatRespository_1.chatRepository.sendMessage(chatId, sender, senderRole, receiver, content);
        });
    }
    getMessages(chatId) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield chatRespository_1.chatRepository.getMessages(chatId);
        });
    }
    getUnreadMessageCount(userId, chatId) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield chatRespository_1.chatRepository.getUnreadMessageCount(userId, chatId);
        });
    }
}
;
exports.chatService = new ChatService();
