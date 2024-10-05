// patient.interface.ts
import { Document } from 'mongoose';

export interface PatientDocument extends Document {
  name: string;
  email: string;
  age: number;
  gender: 'Male' | 'Female' | 'Other';
  location: string;
  status: 'Active' | 'Blocked';
  profilePhoto: string,
  password: string;
  createdAt: Date;
  updatedAt: Date;

  comparePassword(candidatePassword: string): Promise<boolean>; // Method to compare passwords
}
