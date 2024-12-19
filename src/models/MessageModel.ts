import { Document, Schema, Types } from "mongoose";


export interface IMessage extends Document {
  conversationId: Types.ObjectId; 
  sender: Types.ObjectId; 
  senderRole: 'patient' | 'doctor'; 
  content: string; 
  read: boolean; 
  delivered: boolean; 
  createdAt: Date; 
  updatedAt: Date; 
}


const MessageSchema = new Schema<IMessage>(
  {
    conversationId: { type: Schema.Types.ObjectId, ref: "Conversation", required: true }, 
    sender: { type: Schema.Types.ObjectId, required: true }, 
    senderRole: { type: String, enum: ["patient", "doctor"], required: true },
    content: { type: String, required: true },
    read: { type: Boolean, default: false }, 
    delivered: { type: Boolean, default: false }, 
  },
  { timestamps: true }
);
