import { Schema, model, Document } from 'mongoose'
import {DoctorDocument} from '../interfaces/doctorInterface'
import bcrypt from 'bcryptjs';

const doctorSchema = new Schema<DoctorDocument>({
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    kycVerified: { type: Boolean, default: false },
    location: { type: String, required: true },
    experience: { type: Number, required: true },
    specialization: {type: String, required: true},
    gender: { type: String, required: true },
    status: { type: String, default: "active" },
},
    { timestamps: true }
)

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
