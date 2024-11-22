import mongoose, { Document, Schema } from 'mongoose';

export interface IPrescription extends Document {
  symptoms: string;
  diagnosis: string;
  medications: string;
  doctorId?: mongoose.Types.ObjectId;
  patientId?: mongoose.Types.ObjectId;
  date: Date;
}

const prescriptionSchema = new Schema<IPrescription>({
  symptoms: { type: String, required: true },
  diagnosis: { type: String, required: true },
  medications: { type: String, required: true },
  doctorId: { type: Schema.Types.ObjectId, ref: 'Doctor' },
  patientId: { type: Schema.Types.ObjectId, ref: 'Patient' },
  date: { type: Date, default: Date.now },
});

export default mongoose.model<IPrescription>('Prescription', prescriptionSchema);
