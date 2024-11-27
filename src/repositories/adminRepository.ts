import dotenv from 'dotenv';
import { Patient } from '../models/patientModel';
import { Doctor } from '../models/doctorModel';
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
  async getAllDoctors() {
    return Doctor.find();
  }

  // Update the status of a doctor
  async updateDoctorStatus(doctorId: string, status: string) {
    return Doctor.findByIdAndUpdate(
      doctorId,
      { status },
      { new: true } // Return the updated document
    );
  }
}

export const adminRepository = new AdminRepository();
