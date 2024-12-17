import { Document } from 'mongoose';

export interface DoctorDocument extends Document {
  _id: string;  
  name: string;
  email: string;
  password: string;
  kycVerified: boolean;
  locationName: string;
  location: {
    type: string;  // 'Point'
    coordinates: [number, number];  // [longitude, latitude]
  };
  experience: number;
  specialization: string;
  gender: string;
  age: number;
  fees: number;
  profilePhoto: string;
  status: string;
  createdAt: Date;
  updatedAt: Date;

  comparePassword(candidatePassword: string): Promise<boolean>;  
}
