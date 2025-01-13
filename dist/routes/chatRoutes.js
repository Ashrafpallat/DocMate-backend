"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const jwtAuth_1 = __importDefault(require("../middleware/jwtAuth"));
const userStatus_1 = require("../middleware/userStatus");
const chatController_1 = require("../controllers/chatController");
const router = express_1.default.Router();
router.get('/allChats', jwtAuth_1.default, userStatus_1.checkUserStatus, chatController_1.chatController.getUserChats);
router.post('/fetchOrCreateChat', jwtAuth_1.default, userStatus_1.checkUserStatus, chatController_1.chatController.fetchOrCreateChat);
router.post('/send-message', jwtAuth_1.default, userStatus_1.checkUserStatus, chatController_1.chatController.sendMessage);
router.get('/:chatId', jwtAuth_1.default, userStatus_1.checkUserStatus, chatController_1.chatController.getMessages);
router.get('/getUnread-messageCount/:chatId', jwtAuth_1.default, userStatus_1.checkUserStatus, chatController_1.chatController.getUnreadMessageCount);
exports.default = router;
