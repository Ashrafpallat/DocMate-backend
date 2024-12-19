import { Document, Schema, Types } from "mongoose";

// Interface for IConversation
export interface IConversation extends Document {
  patient: Types.ObjectId; 
  doctor: Types.ObjectId; 
  lastMessage: string; 
  lastMessageTime: Date | null; 
  patientLastSeen: Date | null; 
  doctorLastSeen: Date | null; 
  createdAt: Date; 
  updatedAt: Date; 
}


const ConversationSchema = new Schema<IConversation>(
  {
    patient: { type: Schema.Types.ObjectId, ref: "Patient", required: true }, 
    doctor: { type: Schema.Types.ObjectId, ref: "Doctor", required: true }, 
    lastMessage: { type: String, default: "" },
    lastMessageTime: { type: Date, default: null },
    patientLastSeen: { type: Date, default: null }, 
    doctorLastSeen: { type: Date, default: null }, 
  },
  { timestamps: true }
);
