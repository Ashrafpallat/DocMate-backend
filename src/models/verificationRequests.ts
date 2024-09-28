import mongoose from 'mongoose';

const verificationRequestSchema = new mongoose.Schema({
  name: { type: String, required: true },
  regNo: { type: String, required: true },
  yearOfReg: { type: String, required: true },
  medicalCouncil: { type: String, required: true },
  proofFile: { type: String, required: true }, // Ensure this is defined as required
  doctorId: { type: mongoose.Schema.Types.ObjectId, ref: 'Doctor', required: true }, // Ensure this is defined as required
});

const VerificationRequest = mongoose.model('VerificationRequest', verificationRequestSchema);
export default VerificationRequest;
