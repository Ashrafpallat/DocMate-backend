import { Document } from 'mongoose';
import mongoose from 'mongoose';

// Define Slot interface
export type SlotStatus = 'issued' | 'reserved' | 'consulted' | 'cancelled';

export interface Slot {
  start: string;
  end: string;
  status: SlotStatus;
  statusUpdatedAt: Date;
  patientId?: mongoose.Schema.Types.ObjectId; // Change to ObjectId
}

// Define DefaultToken interface
export interface DefaultToken extends Document {
  day: string;
  slots: Slot[];  
  doctorId: mongoose.Schema.Types.ObjectId;
}
