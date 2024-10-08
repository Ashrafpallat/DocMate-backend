import mongoose, { Schema, Document } from 'mongoose';

export interface DoctorDocument extends Document {
  name: string;
  email: string;
  password: string;
  kycVerified: boolean;
  locationName: string
  location: {
    type: string;
    coordinates: [number, number]; // Array of numbers: [longitude, latitude]
  };
  experience: number;
  specialization: string;
  gender: string;
  age: number;
  fees: number;
  profilePhoto: string;
  status: string;
}