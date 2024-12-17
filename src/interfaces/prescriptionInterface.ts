import mongoose, { Document } from 'mongoose';

export interface IPrescription extends Document {
  symptoms: string;
  diagnosis: string;
  medications: string;
  doctorId?: mongoose.Types.ObjectId;
  patientId?: mongoose.Types.ObjectId;
  date: Date;
}
