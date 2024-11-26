// controllers/patientController.ts
import { Request, Response } from 'express';
import { patientService } from '../services/patientService';
import { patientRepository } from '../repositories/patientRepository';
import { generateAccessToken, generateRefreshToken, verifyToken } from '../utils/generateToken';
import cloudinary from '../config/cloudinery';
import Stripe from 'stripe';
import dotenv from 'dotenv';

dotenv.config();

interface CustomRequest extends Request {
  user?: String | any
}

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2024-09-30.acacia',
});

class PatientController {

  async refreshAccessToken(req: Request, res: Response): Promise<Response> {
    try {
      const { refreshToken } = req.cookies;
      if (!refreshToken) {
        return res.status(401).json({ message: 'No refresh token provided' });
      }
      const decoded = verifyToken(refreshToken, true); // Verify the refresh token
      const accessToken = generateAccessToken({ userId: decoded.userId, email: decoded.email, name: decoded.name }, res);
      return res.status(200).json({ message: 'New access token issued' });
    } catch (error: any) {
      return res.status(401).json({ message: 'Invalid or expired refresh token' });
    }
  }

  async googleAuth(req: Request, res: Response): Promise<Response> {
    const { name, email } = req.body;
    try {
      const patient = await patientRepository.googleAuth(name, email);
      generateAccessToken({ userId: patient._id, email: patient.email, name: patient.name }, res);
      generateRefreshToken({ userId: patient._id, email: patient.email, name: patient.name }, res);
      return res.status(200).json({ message: 'User authenticated', patient });
    } catch (error) {
      console.error('Error processing Google authentication:', error);
      return res.status(500).json({ message: 'Internal server error' });
    }
  }

  async signup(req: Request, res: Response): Promise<Response> {
    try {
      const { name, email, password, age, gender, location } = req.body;

      const newPatient = await patientService.registerPatient({
        name,
        email,
        password,
        age,
        gender,
        location,
      });

      return res.status(201).json({ message: 'User registered successfully', newPatient });
    } catch (error: any) {
      return res.status(400).json({ message: error.message });
    }
  }


  async login(req: Request, res: Response): Promise<Response> {
    try {
      const { email, password } = req.body;
      const { patient } = await patientService.loginPatient(email, password);

      const accessToken = generateAccessToken({ userId: patient._id, email: patient.email, name: patient.name }, res);
      const refreshToken = generateRefreshToken({ userId: patient._id, email: patient.email, name: patient.name }, res);

      return res.status(200).json({ message: 'Login successful', patient });
    } catch (error: any) {
      return res.status(400).json({ message: error.message });
    }
  }

  async getProfile(req: CustomRequest, res: Response): Promise<Response> {
    try {
      const patientId = req.user?.userId;
      console.log(patientId);

      const patient = await patientRepository.findPatientById(patientId)
      if (!patient) {
        console.log('patient not found');
        return res.status(404).json({ message: 'patient not found' });
      }

      return res.status(200).json(patient);
    } catch (error) {
      console.error('Error fetching patient profile:', error);
      return res.status(500).json({ message: 'Server error' });
    }
  }
  async updateProfile(req: CustomRequest, res: Response): Promise<Response> {
    try {
      const patientId = req.user?.userId; // Assuming req.user has the authenticated doctorI      
      const patient = await patientRepository.findPatientById(patientId);
      if (!patient) {
        return res.status(404).json({ message: 'patient not found' });
      }
      let profilePhoto = req.file ? req.file.path : patient.profilePhoto
      console.log('profilephoto', profilePhoto);

      const uploadResult = await cloudinary.v2.uploader.upload(profilePhoto);

      const updatedData = {
        name: req.body.name || patient.name,
        email: req.body.email || patient.email,
        age: req.body.age || patient.age,
        location: req.body.location || patient.location,
        profilePhoto: uploadResult.secure_url || patient.profilePhoto || ''
      };

      const updatedDoctor = await patientRepository.updatePatientProfile(patientId, updatedData);

      return res.status(200).json(updatedDoctor);
    } catch (error) {
      console.error('Error updating doctor profile:', error);
      return res.status(500).json({ message: 'Server error' });
    }
  }
  async getDoctorsNearby(req: Request, res: Response): Promise<Response> {
    try {
      const { lat, lng, page = 1, limit = 3 } = req.query; // Default to page 1 and limit 3
      if (!lat || !lng) {
        return res.status(400).json({ message: 'Latitude and longitude are required' });
      }
      const latitude = parseFloat(lat as string);
      const longitude = parseFloat(lng as string);
      if (isNaN(latitude) || isNaN(longitude)) {
        return res.status(400).json({ message: 'Invalid latitude or longitude' });
      }

      // Convert page and limit to numbers
      const pageNum = parseInt(page as string, 10);
      const limitNum = parseInt(limit as string, 10);

      const { doctors, totalCount } = await patientRepository.findDoctorsNearby(latitude, longitude, pageNum, limitNum);
      return res.status(200).json({ doctors, totalCount });
    } catch (error) {
      console.error('Error fetching nearby doctors:', error);
      return res.status(500).json({ message: 'Server error' });
    }
  }




  async logout(req: Request, res: Response): Promise<Response> {
    try {
      // Clear the access token by setting an expired date and consistent properties
      res.cookie('accessToken', '', {
        httpOnly: true,
        secure: process.env.NODE_ENV !== 'development',
        expires: new Date(0), // Expire immediately
        sameSite: 'none',
        path: '/', // Ensure the path is the same
      });

      // Clear the refresh token by setting an expired date and consistent properties
      res.cookie('refreshToken', '', {
        httpOnly: true,
        secure: process.env.NODE_ENV !== 'development',
        expires: new Date(0), // Expire immediately
        sameSite: 'none',
        path: '/', // Ensure the path is the same
      });

      console.log('Logout successful');
      return res.status(200).json({ message: 'Logout successful' });
    } catch (error) {
      return res.status(500).json({ message: 'Server error', error });
    }
  }

  async reserveSlot(req: CustomRequest, res: Response): Promise<Response> {
    try {
      const { doctorId, day, slotIndex } = req.body;
      const patientId = req.user?.userId;

      if (!patientId) {
        return res.status(401).json({ message: 'Authentication required' });
      }
      const reservedSlot = await patientRepository.reserveSlot(doctorId, day, slotIndex, patientId);

      return res.status(200).json({ message: 'Slot reserved successfully', reservedSlot });
    } catch (error: any) {
      console.error('Error reserving slot:', error);
      return res.status(500).json({ message: error.message || 'Server error' });
    }
  }
  async createPaymentSession(req: Request, res: Response) {
    const { doctorId, amount, day, slotIndex } = req.body;

    try {
      const session = await stripe.checkout.sessions.create({
        payment_method_types: ['card'],
        line_items: [
          {
            price_data: {
              currency: 'inr',
              product_data: {
                name: 'Doctor Appointment Booking',
              },
              unit_amount: amount, // Amount in paise (1 INR = 100 paise)
            },
            quantity: 1,
          },
        ],
        mode: 'payment',
        success_url: `${process.env.FRONTEND_URL}/payment-success?doctorId=${doctorId}&day=${day}&slotIndex=${slotIndex}`,
        cancel_url: `${process.env.FRONTEND_URL}/payment-failed`,
      });

      res.json({ sessionId: session.id });
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Could not create payment session' });
    }
  }

  async pendingAppointments(req: CustomRequest, res: Response): Promise<Response> {
    try {
      const patientId = req.user?.userId;

      if (!patientId) {
        return res.status(401).json({ message: 'Authentication required' });
      }

      // Fetch the patient's pending appointments from the service
      const appointments = await patientService.findPendingAppointments(patientId);

      if (!appointments || appointments.length === 0) {
        return res.status(404).json({ message: 'No appointments found' });
      }

      return res.status(200).json({ message: 'Appointments fetched successfully', appointments });
    } catch (error: any) {
      console.error('Error fetching appointments:', error.message);
      return res.status(500).json({ message: error.message || 'Server error' });
    }
  }
  async getPrescriptionsByPatientId(req: CustomRequest, res: Response) {
    try {
      const patientId = req.user?.userId;
      const prescriptions = await patientService.getPrescriptionsByPatientId(patientId);

      res.status(200).json( prescriptions );
    } catch (error: any) {
      res.status(400).json({
        success: false,
        message: error.message,
      });
    }
  }


}

export const patientController = new PatientController();
