import { Types } from "mongoose";

export interface IChat extends Document {
    patient: Types.ObjectId;
    doctor: Types.ObjectId;
    lastMessage: Types.ObjectId;
    lastMessageTime: Date | null;
    patientLastSeen: Date | null;
    doctorLastSeen: Date | null;
    createdAt: Date;
    updatedAt: Date;
  }