import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { doctorRepository } from '../repositories/doctorRepository';
import { DefaultToken } from '../models/defaultTokenModel';

export const doctorService = {
  async registerDoctor(doctorData: any) {
    const existingDoctor = await doctorRepository.findDoctorByEmail(doctorData.email);
    if (existingDoctor) {
      throw new Error('Doctor already exists with this email');
    }

    // Create new doctor in the repository
    const newDoctor = await doctorRepository.createDoctor({
      ...doctorData,
    });

    return newDoctor;
  },

  async loginDoctor(email: string, password: string) {
    const doctor = await doctorRepository.findDoctorByEmail(email);
    if (!doctor) {
      throw new Error('Invalid email or password');
    }

    const isPasswordValid = await bcrypt.compare(password, doctor.password);
    if (!isPasswordValid) {
      throw new Error('Invalid email or password');
    }

    // Generate JWT token with doctor details
    const token = jwt.sign(
      { doctorId: doctor._id, email: doctor.email, name: doctor.name },
      process.env.JWT_SECRET || 'fallback-secret',
      { expiresIn: '30d' }
    );

    return { doctor, token };
  },

  async saveDefaultTokens(day: string, tokens: any[], doctorId: string): Promise<any> {
    // Any business logic can be added here (validation, etc.)

    const savedTokens = await doctorRepository.saveOrUpdateDefaultTokens(day, tokens, doctorId);
    return savedTokens;
  },

  async getDoctorSlots(doctorId: string): Promise<DefaultToken[]> {
    try {
      return await doctorRepository.findSlotsByDoctorId(doctorId);
      // return slots.length > 0 ? slots : [];
    } catch (error) {
      console.error('Error in doctor service:', error);
      throw error;
    }
  }
};
