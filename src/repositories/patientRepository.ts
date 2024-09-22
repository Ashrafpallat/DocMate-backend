import { Patient } from '../models/patientModel';

class PatientRepository {
  async findPatientByEmail(email: string) {
    return await Patient.findOne({ email });
  }

  // Create a new patient
  async createPatient(patientData: any) {
    const patient = new Patient(patientData);
    return await patient.save();
  }

  // Optionally, find patient by ID
  async findPatientById(id: string) {
    return await Patient.findById(id);
  }

  // Update patient status (active/blocked)
  async updatePatientStatus(id: string, status: 'Active' | 'Blocked') {
    return await Patient.findByIdAndUpdate(id, { status }, { new: true });
  }
}

export const patientRepository = new PatientRepository();
