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
    return {
      admin: {
        userId: '123',
        email: adminEmail,
        name: 'DocMate Admin'
      },
      
    };
  }
  async getAllPatients() {
    return adminRepository.getAllPatients();
  }

  async updatePatientStatus(patientId: string, status: string) {
    return adminRepository.updatePatientStatus(patientId, status);
  }
  async fetchAllDoctors() {
    return adminRepository.getAllDoctors();
  }

  // Toggle the status of a doctor
  async updateDoctorStatus(doctorId: string, status: string) {
    // const newStatus = currentStatus === 'active' ? 'blocked' : 'active';
    return adminRepository.updateDoctorStatus(doctorId, status);
  }
}

export const adminService = new AdminService();
