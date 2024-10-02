import { Document } from 'mongoose';

export interface DoctorDocument extends Document {
  name: string;
  email: string;
  password: string;
  kycVerified: boolean;
  location: string;
  experience: number;
  specialization: string;
  gender: string;
  status: string;
  age: number,
  fees: number,
  createdAt: Date;
  updatedAt: Date;
}
