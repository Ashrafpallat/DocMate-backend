import bcrypt from 'bcrypt';
import { doctorRepository } from '../repositories/doctorRepository';
import { DefaultToken } from '../models/defaultTokenModel';

class DoctorService {
  // Register a new doctor
  async registerDoctor(doctorData: any) {
    const existingDoctor = await doctorRepository.findDoctorByEmail(doctorData.email);
    if (existingDoctor) {
      throw new Error('Doctor already exists with this email');
    }

    // Create a new doctor in the repository
    const newDoctor = await doctorRepository.createDoctor({
      ...doctorData,
    });

    return newDoctor;
  }

  // Login a doctor
  async loginDoctor(email: string, password: string) {
    const doctor = await doctorRepository.findDoctorByEmail(email);
    if (!doctor) {
      throw new Error('Invalid email or password');
    }

    const isPasswordValid = await bcrypt.compare(password, doctor.password);
    if (!isPasswordValid) {
      throw new Error('Invalid email or password');
    }

    return { doctor };
  }

  // Save or update default tokens for a specific day and doctor
  async saveDefaultTokens(day: string, tokens: any[], doctorId: string): Promise<any> {
    // Business logic for token validation can be added here
    const savedTokens = await doctorRepository.saveOrUpdateDefaultTokens(day, tokens, doctorId);
    return savedTokens;
  }

  // Get all slots for a specific doctor
  async getDoctorSlots(doctorId: string): Promise<DefaultToken[]> {
    try {
      return await doctorRepository.findSlotsByDoctorId(doctorId);
    } catch (error) {
      console.error('Error in doctor service:', error);
      throw error;
    }
  }
}

// Export an instance of the class
export const doctorService = new DoctorService();
