import mongoose, { Document } from 'mongoose';

interface IVerificationRequest extends Document {
  name: string;
  regNo: string;
  yearOfReg: string;
  medicalCouncil: string;
  proofFile: string;
  doctorId: mongoose.Schema.Types.ObjectId; // Reference to Doctor model
}

export default IVerificationRequest;
