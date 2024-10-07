import { Schema, model, Document } from 'mongoose'
import { DoctorDocument } from '../interfaces/doctorInterface'
import bcrypt from 'bcryptjs';

const doctorSchema = new Schema<DoctorDocument>({
  name: { type: String, },
  email: { type: String, unique: true },
  password: { type: String, },
  kycVerified: { type: Boolean, default: false },
  location: { type: String, },
  latitude: {type: String},
  longitude: {type: String},
  experience: { type: Number, },
  specialization: { type: String, },
  gender: { type: String, },
  age: { type: Number },
  fees: { type: Number },
  profilePhoto: {type: String},
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
