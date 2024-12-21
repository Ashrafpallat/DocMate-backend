import  {Chat}  from '../models/ChatModel'; // Import the actual Chat model
import { IChat } from '../interfaces/ChatInterface';
import { Patient } from '../models/patientModel';
import { Doctor } from '../models/doctorModel';

class ChatRepository {
  async fetchChatsByUserId(userId: string, userRole:string): Promise<IChat[]> {
    const query = {
      $or: [{ patient: userId }, { doctor: userId }],
    };
  
    const chats = await Chat.find(query)
      .sort({ updatedAt: -1 }) 
      .populate(userRole === 'patient' ? 'doctor' : 'patient', 'name profilePhoto');
  
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
      doctor: doctor._id
    });
  
    if (!chat) {
      chat = await Chat.create({
        patient: patient._id,
        doctor: doctor._id,
      });
    }
  
    return chat;
  }
  
}

export const chatRepository = new ChatRepository(); 
