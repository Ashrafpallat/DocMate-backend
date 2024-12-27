import { IChat } from "../interfaces/ChatInterface";
import { chatRepository } from "../repositories/ChatRespository";

 class ChatService  {
  async getChatsForUser(userId: string, userRole: string): Promise<IChat[]> {
    return await chatRepository.fetchChatsByUserId(userId, userRole);
  }

  async getOrCreateChat(user1: string, user2: string): Promise<IChat> {
    return await chatRepository.fetchOrCreateChat(user1, user2);
  }
  async sendMessage(chatId:string, sender:string, senderRole:string,receiver:string, content:string){
    return await chatRepository.sendMessage(chatId, sender, senderRole, receiver, content)
  }
  async getMessages(chatId: string){
    return await chatRepository.getMessages(chatId)
  }
  async getUnreadMessageCount(userId:string,chatId:string ){
    return await chatRepository.getUnreadMessageCount(userId, chatId)
  }
}; 

export const chatService = new ChatService();
