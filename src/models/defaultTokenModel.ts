import mongoose, { Schema, Document } from 'mongoose';

type SlotStatus = 'issued' | 'reserved' | 'consulted' | 'cancelled';

interface Slot {
  start: string;
  end: string;
  status: SlotStatus;  
  patientId?: mongoose.Schema.Types.ObjectId;  
}

const SlotSchema: Schema = new Schema({
  start: { type: String, required: true },
  end: { type: String, required: true },
  status: { type: String, enum: [ 'issued', 'reserved', 'consulted', 'cancelled'], default: 'issued' },  
  patientId: { type: mongoose.Schema.Types.ObjectId, ref: 'Patient', default: null }, 
});

export interface DefaultToken extends Document {
  day: string;
  slots: Slot[];  
  doctorId: mongoose.Schema.Types.ObjectId; 
}

const DefaultTokenSchema: Schema = new Schema({
  day: { type: String, required: true },  
  slots: { type: [SlotSchema], default: [] },  
  doctorId: { type: mongoose.Schema.Types.ObjectId, ref: 'Doctor', required: true }, 
});

export const DefaultTokenModel = mongoose.model<DefaultToken>('DefaultToken', DefaultTokenSchema);
