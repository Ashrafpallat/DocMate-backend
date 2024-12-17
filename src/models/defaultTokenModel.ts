import mongoose, { Schema, Document } from 'mongoose';
import { DefaultToken } from '../interfaces/defaultTokenInterface';


const SlotSchema: Schema = new Schema({
  start: { type: String, required: true },
  end: { type: String, required: true },
  status: { type: String, enum: [ 'issued', 'reserved', 'consulted', 'cancelled'], default: 'issued' },  
  statusUpdatedAt: { type: Date, default: Date.now },
  patientId: { type: mongoose.Schema.Types.ObjectId, ref: 'Patient', default: null }, 
});

const DefaultTokenSchema: Schema = new Schema({
  day: { type: String, required: true },  
  slots: { type: [SlotSchema], default: [] },  
  doctorId: { type: mongoose.Schema.Types.ObjectId, ref: 'Doctor', required: true }, 
});

export const DefaultTokenModel = mongoose.model<DefaultToken>('DefaultToken', DefaultTokenSchema);
