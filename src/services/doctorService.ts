import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { doctorRepository } from '../repositories/doctorRepository';

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

  async saveDefaultTokens(day: string, tokens: any[]): Promise<any> {
    // Any business logic can be added here (validation, etc.)
    
    // Call the repository to save or update the tokens
    const savedTokens = await doctorRepository.saveOrUpdateDefaultTokens(day, tokens);
    return savedTokens;
  }
};
