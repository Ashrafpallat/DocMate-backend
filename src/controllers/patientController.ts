// controllers/patientController.ts
import { Request, Response } from 'express';
import { patientService } from '../services/patientService';
import { patientRepository } from '../repositories/patientRepository';
import { generateAccessToken, generateRefreshToken, verifyToken } from '../utils/generateToken';
import cloudinary from '../config/cloudinery';
import Stripe from 'stripe';
import dotenv from 'dotenv';
import { HttpStatus } from '../utils/HttpStatus'; // Import the HttpStatus enum
import { CustomRequest } from '../interfaces/customRequest';
import { Messages } from '../utils/patientMessages';

dotenv.config();



const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2024-09-30.acacia',
});

class PatientController {

  async refreshAccessToken(req: Request, res: Response): Promise<Response> {
    try {
      const { refreshToken } = req.cookies;
      if (!refreshToken) {
        return res.status(HttpStatus.UNAUTHORIZED).json({ message: Messages.Errors.NO_REFRESH_TOKEN });
      }
      const decoded = verifyToken(refreshToken, true); // Verify the refresh token
      const accessToken = generateAccessToken({ userId: decoded.userId, email: decoded.email, name: decoded.name, role: decoded.role }, res);
      return res.status(HttpStatus.OK).json({ message: Messages.Success.NEW_ACCESSTOKEN });
    } catch (error: any) {
      return res.status(HttpStatus.UNAUTHORIZED).json({ message: Messages.Errors.INVALID_REFRESH_TOKEN });
    }
  }

  async googleAuth(req: Request, res: Response): Promise<Response> {
    const { name, email } = req.body;
    try {
      const patient = await patientRepository.googleAuth(name, email);
      if(patient.status === 'Blocked'){
        return res.status(403).json({ message: Messages.Errors.ACCOUNT_BLOCKED });
      }
      generateAccessToken({ userId: patient._id, email: patient.email, name: patient.name, role: patient.role }, res);
      generateRefreshToken({ userId: patient._id, email: patient.email, name: patient.name, role: patient.role }, res);
      return res.status(HttpStatus.OK).json({ message: 'User authenticated', patient });
    } catch (error) {
      console.error('Error processing Google authentication:', error);
      return res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({ message: Messages.Errors.INTERNAL_SERVER_ERROR });
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

      return res.status(HttpStatus.OK).json({ message: Messages.Success.USER_REGISTERED, newPatient });
    } catch (error: any) {
      return res.status(HttpStatus.BAD_REQUEST).json({ message: error.message });
    }
  }


  async login(req: Request, res: Response): Promise<Response> {
    try {
      const { email, password } = req.body;
      const { patient } = await patientService.loginPatient(email, password);
      if(patient.status === 'Blocked'){
        return res.status(403).json({ message: Messages.Errors.ACCOUNT_BLOCKED });
      }
      const accessToken = generateAccessToken({ userId: patient._id, email: patient.email, name: patient.name, role: patient.role }, res);
      const refreshToken = generateRefreshToken({ userId: patient._id, email: patient.email, name: patient.name, role: patient.role }, res);

      return res.status(HttpStatus.OK).json({ message: Messages.Success.LOGIN_SUCCESSFUL, patient });
    } catch (error: any) {
      return res.status(HttpStatus.BAD_REQUEST).json({ message: error.message });
    }
  }

  async getProfile(req: CustomRequest, res: Response): Promise<Response> {
    try {
      const patientId = req.user?.userId;
      console.log('patient id frm patient ctrlr, getProfile',patientId);

      const patient = await patientRepository.findPatientById(patientId)
      if (!patient) {
        console.log(Messages.Errors.PATIENT_NOT_FOUND);
        return res.status(HttpStatus.UNAUTHORIZED).json({ message: Messages.Errors.PATIENT_NOT_FOUND });
      }

      return res.status(HttpStatus.OK).json(patient);
    } catch (error) {
      console.error('Error fetching patient profile:', error);
      return res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({ message: Messages.Errors.INTERNAL_SERVER_ERROR });
    }
  }
  async updateProfile(req: CustomRequest, res: Response): Promise<Response> {
    try {
      const patientId = req.user?.userId;    
      const patient = await patientRepository.findPatientById(patientId);
      if (!patient) {
        return res.status(HttpStatus.NOT_FOUND).json({ message: Messages.Errors.PATIENT_NOT_FOUND });
      }
      let profilePhoto = req.file ? req.file.path : patient.profilePhoto
      console.log('profilephoto', profilePhoto);

      if (req.file) {
        const uploadResult = await cloudinary.v2.uploader.upload(req.file.path);
        profilePhoto = uploadResult.secure_url; // Update with the new uploaded photo URL
      } else if (!patient.profilePhoto) {
        profilePhoto = 'https://example.com/default-profile.png'; // Placeholder default image
      }

      // const uploadResult = await cloudinary.v2.uploader.upload(profilePhoto);

      const updatedData = {
        name: req.body.name || patient.name,
        email: req.body.email || patient.email,
        age: req.body.age || patient.age,
        location: req.body.location || patient.location,
        profilePhoto
      };

      const updatedDoctor = await patientRepository.updatePatientProfile(patientId, updatedData);

      return res.status(HttpStatus.OK).json(updatedDoctor);
    } catch (error) {
      console.error('Error updating doctor profile:', error);
      return res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({ message: Messages.Errors.INTERNAL_SERVER_ERROR });
    }
  }
  async getDoctorsNearby(req: Request, res: Response): Promise<Response> {
    try {
      const { lat, lng, page = 1, limit = 3 } = req.query; // Default to page 1 and limit 3
      if (!lat || !lng) {
        return res.status(HttpStatus.BAD_REQUEST).json({ message: Messages.Errors.INVALID_LAT_LNG });
      }
      const latitude = parseFloat(lat as string);
      const longitude = parseFloat(lng as string);
      if (isNaN(latitude) || isNaN(longitude)) {
        return res.status(HttpStatus.BAD_REQUEST).json({ message: Messages.Errors.INVALID_LAT_LNG });
      }

      // Convert page and limit to numbers
      const pageNum = parseInt(page as string, 10);
      const limitNum = parseInt(limit as string, 10);

      const { doctors, totalCount } = await patientRepository.findDoctorsNearby(latitude, longitude, pageNum, limitNum);
      return res.status(HttpStatus.OK).json({ doctors, totalCount });
    } catch (error) {
      console.error('Error fetching nearby doctors:', error);
      return res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({ message: Messages.Errors.INTERNAL_SERVER_ERROR });
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
      return res.status(HttpStatus.OK).json({ message: Messages.Success.LOGOUT_SUCCESSFUL });
    } catch (error) {
      return res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({ message: Messages.Errors.INTERNAL_SERVER_ERROR, error });
    }
  }

  async reserveSlot(req: CustomRequest, res: Response): Promise<Response> {
    try {
      const { doctorId, day, slotIndex } = req.body;
      const patientId = req.user?.userId;

      if (!patientId) {
        return res.status(HttpStatus.UNAUTHORIZED).json({ message: Messages.Errors.AUTHENTICATION_REQUIRED });
      }
      const reservedSlot = await patientRepository.reserveSlot(doctorId, day, slotIndex, patientId);

      return res.status(HttpStatus.OK).json({ message: 'Slot reserved successfully', reservedSlot });
    } catch (error: any) {
      console.error('Error reserving slot:', error);
      return res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({ message: error.message || Messages.Errors.INTERNAL_SERVER_ERROR });
    }
  }
  async createPaymentSession(req: Request, res: Response) {
    const { doctorId, amount, day, slotIndex } = req.body;
    if (!doctorId) {
      throw new Error('Doctor ID is missing');
    }
    
    if (!amount) {
      throw new Error('Amount is missing');
    }
    
    if (!day) {
      throw new Error('Day is missing');
    }
    
    if (slotIndex === null || slotIndex === undefined) {
      throw new Error('Slot index is missing');
    }
    
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
        success_url: `${process.env.FRONTEND_URL}/patient/payment-success?doctorId=${doctorId}&day=${day}&slotIndex=${slotIndex}`,
        cancel_url: `${process.env.FRONTEND_URL}/patient/payment-failed`,
      });

      res.json({ sessionId: session.id });
    } catch (error) {
      console.error(error);
      res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({ error: 'Could not create payment session' });
    }
  }

  async pendingAppointments(req: CustomRequest, res: Response): Promise<Response> {
    try {
      const patientId = req.user?.userId;

      if (!patientId) {
        return res.status(HttpStatus.UNAUTHORIZED).json({ message: Messages.Errors.AUTHENTICATION_REQUIRED });
      }

      // Fetch the patient's pending appointments from the service
      const appointments = await patientService.findPendingAppointments(patientId);

      // if (!appointments || appointments.length === 0) {
      //   return res.status(HttpStatus.NOT_FOUND).json({ message: 'No appointments found' });
      // }

      return res.status(HttpStatus.OK).json({ message: Messages.Success.APPOINTMENTS_FETCHED, appointments });
    } catch (error: any) {
      console.error('Error fetching appointments:', error.message);
      return res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({ message: error.message || Messages.Errors.INTERNAL_SERVER_ERROR });
    }
  }
  async getPrescriptionsByPatientId(req: CustomRequest, res: Response) {
    try {
      const patientId = req.user?.userId;
      const prescriptions = await patientService.getPrescriptionsByPatientId(patientId);

      res.status(HttpStatus.OK).json( prescriptions );
    } catch (error: any) {
      res.status(HttpStatus.BAD_REQUEST).json({
        success: false,
        message: error.message,
      });
    }
  }
  
  async addReviewAndRating(req: CustomRequest, res: Response){
    const patientId = req.user?.userId;
    const {doctorId, rating, reviewText} = req.body    
    await patientService.addReviewAndRating(patientId, doctorId, rating, reviewText)
    return res.status(HttpStatus.OK).json({ message: Messages.Success.REVIEW_ADDED });
  }

}

export const patientController = new PatientController();
