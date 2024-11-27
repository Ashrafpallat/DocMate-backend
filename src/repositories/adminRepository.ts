import dotenv from 'dotenv';
import { Patient } from '../models/patientModel';
dotenv.config();

class AdminRepository {
  async findAdminByEmail(email: string) {
    if (email === process.env.ADMIN_EMAIL) {
      return {
        email: process.env.ADMIN_EMAIL,
        password: process.env.ADMIN_PASSWORD, // This would be the hashed password in production
      };
    }

    // If no match found, return null
    return null;
  }
  async getAllPatients() {
    return Patient.find(); // Fetch all patients
  }

  async updatePatientStatus(patientId: string, status: string) {
    return Patient.findByIdAndUpdate(patientId, { status }, { new: true }); // Update status (Active, Blocked)
  }
}

export const adminRepository = new AdminRepository();
