import { IChat } from "../interfaces/ChatInterface";
import { chatRepository } from "../repositories/ChatRespository";

 class ChatService  {
  // Fetch all chats for a user
  async getChatsForUser(userId: string, userRole: string): Promise<IChat[]> {
    return await chatRepository.fetchChatsByUserId(userId, userRole);
  }

  // Fetch a specific chat between a patient and a doctor, or create one if it doesn't exist
  async getOrCreateChat(user1: string, user2: string): Promise<IChat> {
    return await chatRepository.fetchOrCreateChat(user1, user2);
  }
};

export const chatService = new ChatService();
