import { Chat } from '../models/ChatModel'; // Import the actual Chat model
import { IChat } from '../interfaces/ChatInterface';
import { Patient } from '../models/patientModel';
import { Doctor } from '../models/doctorModel';
import { Message } from '../models/MessageModel';

class ChatRepository {
  async fetchChatsByUserId(userId: string, userRole: string): Promise<IChat[]> {
    const query = {
      $or: [{ patient: userId }, { doctor: userId }],
    };

    const chats = await Chat.find(query)
    .sort({ updatedAt: -1 })
    .populate(userRole === 'patient' ? 'doctor' : 'patient', 'name profilePhoto')
    .populate('lastMessage', 'content sender createdAt'); 

    return chats;
  }

  // Fetch or create a chat by patient and doctor IDs
  async fetchOrCreateChat(user1: string, user2: string): Promise<IChat> {
    let patient = await Patient.findById(user1);
    let doctor = await Doctor.findById(user2);
    if (!patient) {
      patient = await Patient.findById(user2);
      doctor = await Doctor.findById(user1);
    }
    if (!patient) {
      throw new Error("Neither user1 nor user2 is a valid patient");
    }
    if (!doctor) {
      throw new Error("Doctor not found");
    }
    let chat = await Chat.findOne({
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
      chat = await Chat.create({
        patient: patient._id,
        doctor: doctor._id,
      });

      chat = await Chat.findById(chat._id).populate({
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
  }
  async sendMessage(chatId: string, sender: string, senderRole: string, receiver: string, content: string) {
    const newMessage = {
      chatId,
      sender,
      senderRole,
      receiver,
      content
    }
    const message = await Message.create(newMessage)
    await Chat.findByIdAndUpdate(chatId, {
      lastMessage: message._id,
      lastMessageTime: new Date(),
    });
    return message
  }
  async getMessages(chatId: string) {
    // Fetch messages and update their 'read' status to true
    const messages = await Message.find({ chatId })
      .populate({
        path: "sender",
        select: "name profilePhoto", 
      });
  
    // Update all unread messages to read
    await Message.updateMany(
      { chatId, read: false }, // Only update unread messages
      { $set: { read: true } } // Set read field to true
    );
  
    return messages;
  }
  
  async getUnreadMessageCount(userId: string, chatId: string) {
      const unreadCount = await Message.countDocuments({
        receiver: userId,
        chatId: chatId,
        read: false,
      });
      return unreadCount;
  }
}

export const chatRepository = new ChatRepository(); 
