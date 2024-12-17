// patient.interface.ts
import { Document } from 'mongoose';

export interface PatientDocument extends Document {
  _id: string;  // Making _id optional
  name: string;
  email: string;
  password: string;
  age: number;
  gender: 'Male' | 'Female' | 'Other';
  location: string;
  status: 'Active' | 'Blocked';
  profilePhoto?: string;  // Making profilePhoto optional
  createdAt?: Date;
  updatedAt?: Date;

  comparePassword(candidatePassword: string): Promise<boolean>;
}
