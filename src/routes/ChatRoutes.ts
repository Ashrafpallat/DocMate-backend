import express from "express";
import authMiddleware from "../middleware/jwtAuth";
import { checkUserStatus } from "../middleware/userStatus";
import { chatController } from "../controllers/ChatController";

const router = express.Router();

router.get('/allChats', authMiddleware, checkUserStatus, chatController.getUserChats)
router.post('/fetchOrCreateChat', authMiddleware, checkUserStatus, chatController.fetchOrCreateChat)
router.post('/send-message', authMiddleware, checkUserStatus, chatController.sendMessage)
router.get('/:chatId', authMiddleware, checkUserStatus, chatController.getMessages)
 
export default router;
