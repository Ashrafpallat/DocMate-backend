import bcrypt from 'bcrypt';
import { Schema, model } from 'mongoose';
import { PatientDocument } from '../interfaces/patientInterface'; // Assuming you have the interface for PatientDocument

const patientSchema = new Schema<PatientDocument>({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  age: { type: Number, required: true },
  gender: { type: String, required: true },
  location: { type: String, required: true },
  status: { type: String, default: 'Active' },
  password: { type: String, required: true },
  createdAt: { type: Date, default: Date.now }
});

// Hash the password before saving the Patient model
patientSchema.pre('save', async function (next) {
  const patient = this as PatientDocument;

  if (!patient.isModified('password')) {
    return next();
  }

  const salt = await bcrypt.genSalt(10);
  patient.password = await bcrypt.hash(patient.password, salt);

  next();
});

export const Patient = model<PatientDocument>('Patient', patientSchema);
