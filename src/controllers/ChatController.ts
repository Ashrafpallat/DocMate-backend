import { Request, Response } from "express";
import { chatService } from "../services/ChatService"; 
import { CustomRequest } from "../interfaces/customRequest";


 class ChatController {
  // Get all chats for a user
  async getUserChats(req: CustomRequest, res: Response): Promise<Response> {
    try {
      const userId = req.user?.userId;
      const userRole = req.user?.role
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

  // Get a specific chat between a patient and a doctor, or create one if it doesn't exist
  async fetchOrCreateChat(req: CustomRequest, res: Response): Promise<Response> {
    try {
      const { user1 } = req.body; 
      const user2 = req.user?.userId;
      const chat = await chatService.getOrCreateChat(user1, user2);
      return res.status(200).json(chat);
    } catch (error) {
      console.error("Error fetching or creating chat:", error);
      return res.status(500).json({ error: "Failed to fetch or create chat" });
    }
  }
};
export const chatController = new ChatController();
