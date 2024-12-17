import mongoose, { Document } from 'mongoose';

export interface IReview extends Document {
  doctorId: mongoose.Types.ObjectId;
  patientId: mongoose.Types.ObjectId;
  rating: number;
  review: string;
  createdAt: Date;
}
