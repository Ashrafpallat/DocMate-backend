import jwt from 'jsonwebtoken';
import { adminRepository } from '../repositories/adminRepository';

class AdminService {
  async loginAdmin(email: string, password: string) {
    const adminEmail = process.env.ADMIN_EMAIL;
    const adminPassword = process.env.ADMIN_PASSWORD;
    if (email !== adminEmail) {
      throw new Error('Invalid email or password');
    }
    if (password !== adminPassword) {
      throw new Error('Invalid email or password');
    }
    const token = jwt.sign(
      { email: adminEmail, role: 'admin' },
      process.env.JWT_SECRET || 'fallback-secret', // Use a secret from environment variables
      { expiresIn: '30d' } // Token expires in 30 days
    );
    return {
      admin: {
        email: adminEmail,
        name: 'DocMate Admin'
      },
      token
    };
  }
  async getAllPatients() {
    return adminRepository.getAllPatients();
  }

  async updatePatientStatus(patientId: string, status: string) {
    return adminRepository.updatePatientStatus(patientId, status);
  }
}

export const adminService = new AdminService();
