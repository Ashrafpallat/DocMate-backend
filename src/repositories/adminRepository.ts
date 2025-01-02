import dotenv from 'dotenv';
import { Patient } from '../models/patientModel';
import { Doctor } from '../models/doctorModel';
import prescriptionModel from '../models/prescriptionModel';
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
  async getAllPrescriptions(){
    return prescriptionModel.find()
  }
  async getPatientsByMonth(year: number) {
    try {
      const result = await Patient.aggregate([
        // Match documents for the specific year
        {
          $match: {
            createdAt: {
              $gte: new Date(`${year}-01-01`),
              $lt: new Date(`${year + 1}-01-01`),
            },
          },
        },
        // Project the month from createdAt
        {
          $project: {
            month: { $month: '$createdAt' },
          },
        },
        // Group by month and count patients
        {
          $group: {
            _id: '$month',
            patientCount: { $sum: 1 },
          },
        },
        // Sort by month in ascending order
        {
          $sort: { _id: 1 },
        },
      ]);
  
      // Format the result to include month names if needed
      const months = [
        'January', 'February', 'March', 'April', 'May', 'June',
        'July', 'August', 'September', 'October', 'November', 'December',
      ];
  
      const formattedResult = result.map(item => ({
        month: months[item._id - 1],
        patientCount: item.patientCount,
      }));
  
      return formattedResult;
    } catch (error) {
      console.error('Error fetching patients by month:', error);
      throw new Error('Unable to fetch patient data');
    }
  }
  async getPatientsByYear(years: number[]) {
    try {
      const result = await Patient.aggregate([
        // Match documents for the specified years
        {
          $match: {
            createdAt: {
              $gte: new Date(`${Math.min(...years)}-01-01`),
              $lt: new Date(`${Math.max(...years) + 1}-01-01`),
            },
          },
        },
        // Project the year from createdAt
        {
          $project: {
            year: { $year: '$createdAt' },
          },
        },
        // Group by year and count patients
        {
          $group: {
            _id: '$year',
            patientCount: { $sum: 1 },
          },
        },
        // Sort by year in ascending order
        {
          $sort: { _id: 1 },
        },
      ]);
  
      // Format the result
      const formattedResult = result.map(item => ({
        year: item._id,
        patientCount: item.patientCount,
      }));
  
      return formattedResult;
    } catch (error) {
      console.error('Error fetching patients by year:', error);
      throw new Error('Unable to fetch patient data');
    }
  }
  async getDoctorsByMonth(year: number) {
    try {
      const result = await Doctor.aggregate([
        {
          $match: {
            createdAt: {
              $gte: new Date(`${year}-01-01T00:00:00Z`),
              $lt: new Date(`${year + 1}-01-01T00:00:00Z`),
            },
          },
        },
        {
          $group: {
            _id: { $month: '$createdAt' },
            doctorCount: { $sum: 1 },
          },
        },
        {
          $sort: { _id: 1 },
        },
      ]);
  
      // Map the result to include month names
      const months = [
        'January', 'February', 'March', 'April', 'May', 'June',
        'July', 'August', 'September', 'October', 'November', 'December',
      ];
  
      const formattedResult = result.map(item => ({
        month: months[item._id - 1], // Convert month number to month name
        doctorCount: item.doctorCount, // Keep the doctor count
      }));
  
      return formattedResult;
    } catch (error) {
      console.error('Error fetching doctors by month:', error);
      throw error;
    }
  }
  async getDoctorsByYear(years: number[]) { 
    try {
      const result = await Doctor.aggregate([
        {
          $match: {
            createdAt: {
              $gte: new Date(`${years[0]}-01-01`), // Match documents from the first day of the provided year
              $lt: new Date(`${years[0] + 1}-01-01`), // Match documents before the first day of the next year
            },
          },
        },
        {
          $group: {
            _id: { $year: '$createdAt' }, // Group by the year of the createdAt field
            doctorCount: { $sum: 1 }, // Count the number of doctors per year
          },
        },
        {
          $sort: { _id: 1 }, // Sort by year in ascending order
        },
      ]);
  
      // Map the result to return year and doctorCount
      const formattedResult = result.map(item => ({
        year: item._id, // The _id will contain the year
        doctorCount: item.doctorCount, // The count of doctors for that year
      }));
  
      return formattedResult;
    } catch (error) {
      console.error('Error fetching doctors by year:', error);
      throw error;
    }
  }
}

export const adminRepository = new AdminRepository();
