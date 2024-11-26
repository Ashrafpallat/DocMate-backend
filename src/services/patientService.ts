import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { patientRepository } from '../repositories/patientRepository';

export const patientService = {
  async registerPatient(patientData: any) {
    const existingPatient = await patientRepository.findPatientByEmail(patientData.email);
    if (existingPatient) {
      throw new Error('User already exists with this email');
    }

    // Create new patient in the repository
    const newPatient = await patientRepository.createPatient({
      ...patientData,
    });

    return newPatient;
  },

  async loginPatient(email: string, password: string) {
    const patient = await patientRepository.findPatientByEmail(email);
    if (!patient) {
      throw new Error('Invalid email or password');
    }

    const isPasswordValid = await bcrypt.compare(password, patient.password);
    if (!isPasswordValid) {
      throw new Error('Invalid email or password');
    }

    // Generate JWT token with patient details
    const token = jwt.sign(
      { patientId: patient._id, email: patient.email, name: patient.name },
      process.env.JWT_SECRET || 'fallback-secret',
      { expiresIn: '30d' }
    );
    return { patient, token };
  },

  async findPendingAppointments(patientId: string) {
    try {
      const pendingAppointments = await patientRepository.findPendingAppointments(patientId);
      return pendingAppointments;
    } catch (error) {
      console.error('Error fetching pending appointments:', error);
      throw new Error('Could not fetch pending appointments');
    }
  },
};
