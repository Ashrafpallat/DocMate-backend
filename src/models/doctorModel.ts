import { Schema, model, Document } from 'mongoose';
import { DoctorDocument } from '../interfaces/doctorInterface';
import bcrypt from 'bcryptjs';

const doctorSchema = new Schema<DoctorDocument>(
  {
    name: { type: String },
    email: { type: String, unique: true },
    password: { type: String },
    kycVerified: { type: Boolean, default: false },
    locationName: { type: String },
    location: {
      type: {
        type: String, // 'Point'
        enum: ['Point'], // Must be 'Point'
      },
      coordinates: {
        type: [Number], // Array of numbers: [longitude, latitude]
      },
    },
    experience: { type: Number },
    specialization: { type: String },
    gender: { type: String },
    age: { type: Number },
    fees: { type: Number },
    profilePhoto: { type: String },
    status: { type: String, default: 'Active' },
  },
  { timestamps: true }
);

// Create a geospatial index on the location field
doctorSchema.index({ location: '2dsphere' }); // Index for geospatial queries

doctorSchema.pre('save', async function (next) {
  const doctor = this as DoctorDocument;

  if (!doctor.isModified('password')) {
    return next();
  }

  const salt = await bcrypt.genSalt(10);
  doctor.password = await bcrypt.hash(doctor.password, salt);

  next();
});

export const Doctor = model<DoctorDocument>('Doctor', doctorSchema);
