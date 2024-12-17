import mongoose from 'mongoose';

const verificationRequestSchema = new mongoose.Schema({
  name: { type: String, required: true },
  regNo: { type: String, required: true },
  yearOfReg: { type: String, required: true },
  medicalCouncil: { type: String, required: true },
  proofFile: { type: String, required: true }, 
  doctorId: { type: mongoose.Schema.Types.ObjectId, ref: 'Doctor', required: true }, 
});

const VerificationRequest = mongoose.model('VerificationRequest', verificationRequestSchema);
export default VerificationRequest;
