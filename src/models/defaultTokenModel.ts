import mongoose, { Schema, Document } from 'mongoose';

// Define the Slot interface and schema
interface Slot {
  start: string;
  end: string;
}

const SlotSchema: Schema = new Schema({
  start: { type: String, required: true },
  end: { type: String, required: true },
});

// Define the DefaultToken interface and schema
export interface DefaultToken extends Document {
  day: string;
  slots: Slot[];  // Array of time slots 
  doctorId: mongoose.Schema.Types.ObjectId; // Reference to Doctor
}

const DefaultTokenSchema: Schema = new Schema({
  day: { type: String, required: true },  // Example: 'Monday', 'Tuesday', etc.
  slots: { type: [SlotSchema], default: [] },  // Array of slots
  doctorId: { type: mongoose.Schema.Types.ObjectId, ref: 'Doctor', required: true }, // Reference to Doctor
});

// Create and export the model
export const DefaultTokenModel = mongoose.model<DefaultToken>('DefaultToken', DefaultTokenSchema);
