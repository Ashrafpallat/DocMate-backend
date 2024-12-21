import { Document, model, Schema, Types } from "mongoose";
import { IChat } from "../interfaces/ChatInterface";



const ChatSchema = new Schema<IChat>(
  {
    patient: { type: Schema.Types.ObjectId, ref: "Patient", required: true },
    doctor: { type: Schema.Types.ObjectId, ref: "Doctor", required: true },
    lastMessage: { type: Schema.Types.ObjectId, ref: "Message", default: null }, // Referencing the Message model
    lastMessageTime: { type: Date, default: null },
    patientLastSeen: { type: Date, default: null },
    doctorLastSeen: { type: Date, default: null },
  },
  { timestamps: true }
);
export const Chat = model<IChat>('Chat', ChatSchema);
