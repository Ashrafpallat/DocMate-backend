import { Request, Response } from "express";
import { chatService } from "../services/ChatService"; 
import { CustomRequest } from "../interfaces/customRequest";


 class ChatController {
  async getUserChats(req: CustomRequest, res: Response): Promise<Response> {
    try {
      const userId = req.user?.userId;
      const userRole = req.user?.role
      console.log('req.user', req.user);
      
      if (!userId || !userRole) {
        throw new Error("User ID or role is missing.");
      }      
      const chats = await chatService.getChatsForUser(userId, userRole);
      return res.status(200).json(chats);
    } catch (error) {
      console.error("Error fetching chats:", error);
      return res.status(500).json({ error: "Failed to fetch chats" });
    }
  }

  async fetchOrCreateChat(req: CustomRequest, res: Response): Promise<Response> {
    try {
      const { user1 } = req.body; 
      const user2 = req.user?.userId;
      console.log('user1-', user1, 'user2-',user2);
    
      const chat = await chatService.getOrCreateChat(user1, user2);
      return res.status(200).json(chat);
    } catch (error) {
      console.error("Error fetching or creating chat:", error);
      return res.status(500).json({ error: "Failed to fetch or create chat" });
    }
  }
  async sendMessage(req: CustomRequest,res: Response){
    try {
      const sender = req.user?.userId
      const senderRole = req.user?.role
      const {chatId, receiver, content} = req.body
      console.log('req.body',req.body);
      
      const message = await chatService.sendMessage(chatId, sender, senderRole, receiver, content)
      return res.status(200).json(message)
    } catch (error) {
      console.log('error sending meesage controler', error);
    }
  }
  async getMessages(req: CustomRequest, res: Response){
    try {
      const chatId = req.params.chatId      
      const messages = await chatService.getMessages(chatId)
      return res.status(200).json(messages)
    } catch (error) {
      console.log('error fetching messages',error);
    }
  }
};
export const chatController = new ChatController();
