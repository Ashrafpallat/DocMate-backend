import { Document, Schema, Types } from "mongoose";

export interface IMessage extends Document {
  chatId: Types.ObjectId; 
  sender: Types.ObjectId; 
  senderRole: 'patient' | 'doctor'; 
  receiver: Types.ObjectId; 
  content: string; 
  read: boolean; 
  delivered: boolean; 
  createdAt: Date; 
  updatedAt: Date; 
}

const MessageSchema = new Schema<IMessage>(
  {
    chatId: { type: Schema.Types.ObjectId, ref: "Chat", required: true }, 
    sender: { type: Schema.Types.ObjectId, required: true }, 
    senderRole: { type: String, enum: ["patient", "doctor"], required: true }, 
    receiver: { type: Schema.Types.ObjectId, required: true }, 
    content: { type: String, required: true }, 
    read: { type: Boolean, default: false }, 
    delivered: { type: Boolean, default: false }, 
  },
  { timestamps: true }
);
