import bcrypt from 'bcrypt';
import { patientRepository } from '../repositories/patientRepository';

class PatientService {
  // Register a new patient
  async registerPatient(patientData: any) {
    const existingPatient = await patientRepository.findPatientByEmail(patientData.email);
    if (existingPatient) {
      throw new Error('User already exists with this email');
    }

    // Create a new patient in the repository
    const newPatient = await patientRepository.createPatient({
      ...patientData,
    });

    return newPatient;
  }

  // Login a patient
  async loginPatient(email: string, password: string) {
    const patient = await patientRepository.findPatientByEmail(email);
    if (!patient) {
      throw new Error('Invalid email or password');
    }

    const isPasswordValid = await bcrypt.compare(password, patient.password);
    if (!isPasswordValid) {
      throw new Error('Invalid email or password');
    }
    return { patient };
  }

  // Fetch pending appointments for a patient
  async findPendingAppointments(patientId: string) {
    try {
      const pendingAppointments = await patientRepository.findPendingAppointments(patientId);
      return pendingAppointments;
    } catch (error) {
      console.error('Error fetching pending appointments:', error);
      throw new Error('Could not fetch pending appointments');
    }
  }

  // Get prescriptions by patient ID
  async getPrescriptionsByPatientId(patientId: string) {
    if (!patientId) {
      throw new Error('Patient ID is required');
    }

    const prescriptions = await patientRepository.getPrescriptionsByPatientId(patientId);
    if (!prescriptions || prescriptions.length === 0) {
      throw new Error('No prescriptions found for this patient');
    }

    return prescriptions;
  }
}

// Export an instance of the class
export const patientService = new PatientService();
