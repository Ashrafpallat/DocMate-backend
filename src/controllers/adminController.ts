import { Request, Response } from 'express';
import { adminService } from '../services/adminService';
import verificationRequestRepository from '../repositories/verificationRequestRepository';
import { HttpStatus } from '../utils/HttpStatus'; // Import the HttpStatus enum

class AdminController {
  async login(req: Request, res: Response): Promise<Response> {
    try {
      const { email, password } = req.body;

      const { admin, token } = await adminService.loginAdmin(email, password);

      res.cookie('token', token, {
        httpOnly: true, // Cookie is only accessible by the server
        secure: process.env.NODE_ENV === 'production', // Secure cookie in production (HTTPS)
        maxAge: 30 * 24 * 60 * 60 * 1000, // 30 days
      });

      return res.status(HttpStatus.OK).json({ message: 'Admin login successful', admin });
    } catch (error: any) {
      return res.status(HttpStatus.BAD_REQUEST).json({ message: error.message });
    }
  }

  async getPendingVerifications(req: Request, res: Response): Promise<Response> {
    try {
      const pendingRequests = await verificationRequestRepository.getPendingRequests();
      return res.status(HttpStatus.OK).json(pendingRequests);
    } catch (error) {
      console.error('Error fetching pending verifications:', error);
      return res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({ message: 'Internal server error' });
    }
  }

  async approveVerification(req: Request, res: Response): Promise<Response> {
    const id = req.params.id;

    try {
      const approvedRequest = await verificationRequestRepository.approveRequest(id);
      if (!approvedRequest) {
        return res.status(HttpStatus.NOT_FOUND).json({ message: 'Verification request not found' });
      }
      return res.status(HttpStatus.OK).json({ message: 'Doctor approved successfully', approvedRequest });
    } catch (error) {
      console.error('Error approving verification:', error);
      return res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({ message: 'Internal server error' });
    }
  }
  async getAllPatients(req: Request, res: Response): Promise<Response> {
    try {
      const patients = await adminService.getAllPatients();
      return res.status(HttpStatus.OK).json(patients);
    } catch (error) {
      console.error('Error fetching patients:', error);
      return res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({ message: 'Internal server error' });
    }
  }

  async updatePatientStatus(req: Request, res: Response): Promise<Response> {
    const { patientId } = req.params;
    const { status } = req.body;

    try {
      const updatedPatient = await adminService.updatePatientStatus(patientId, status);
      if (!updatedPatient) {
        return res.status(HttpStatus.NOT_FOUND).json({ message: 'Patient not found' });
      }
      return res.status(HttpStatus.OK).json({ message: 'Patient status updated successfully', updatedPatient });
    } catch (error) {
      console.error('Error updating patient status:', error);
      return res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({ message: 'Internal server error' });
    }
  }

  async logout(req: Request, res: Response): Promise<Response> {
    try {
      res.cookie('token', '', {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        expires: new Date(0), // Expire immediately
      });

      return res.status(HttpStatus.OK).json({ message: 'Logout successful' });
    } catch (error) {
      return res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({ message: 'Server error', error });
    }
  }
  async getAllDoctors(req: Request, res: Response) {
    try {
      const doctors = await adminService.fetchAllDoctors();
      res.status(200).json(doctors);
    } catch (error) {
      res.status(500).json({ message: 'Failed to fetch doctors', error });
    }
  }

  // Block/Unblock a doctor
  async updateDoctorStatus(req: Request, res: Response) {
    try {      
      const { doctorId } = req.params;
      const { status } = req.body;

      const updatedDoctor = await adminService.updateDoctorStatus(doctorId, status);

      if (!updatedDoctor) {
        return res.status(404).json({ message: 'Doctor not found' });
      }

      res.status(200).json({ message: `Doctor ${updatedDoctor.status === 'Active' ? 'unblocked' : 'Blocked'} successfully`, doctor: updatedDoctor });
    } catch (error) {
      res.status(500).json({ message: 'Failed to update doctor status', error });
    }
  }
}

export const adminController = new AdminController();
