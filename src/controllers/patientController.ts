// controllers/patientController.ts
import { Request, Response } from 'express';
import { patientService } from '../services/patientService';
import { patientRepository } from '../repositories/patientRepository';
import { generateAccessToken, generateRefreshToken, verifyToken } from '../utils/generateToken';
import cloudinary from '../config/cloudinery';

interface CustomRequest extends Request {
  user?: String | any
}
class PatientController {

  async refreshAccessToken(req: Request, res: Response): Promise<Response> {
    try {
      const { refreshToken } = req.cookies;
      if (!refreshToken) {
        return res.status(401).json({ message: 'No refresh token provided' });
      }
      const decoded = verifyToken(refreshToken, true); // Verify the refresh token
      // Generate and set the new access token using the utility function
      const accessToken = generateAccessToken({ patientId: decoded.patientId, email: decoded.email, name: decoded.name }, res);
      // No need to manually set the cookie here, as it's done in the `generateAccessToken` function
      return res.status(200).json({ message: 'New access token issued' });
    } catch (error: any) {
      return res.status(401).json({ message: 'Invalid or expired refresh token' });
    }
  }

  async googleAuth(req: Request, res: Response): Promise<Response> {
    const { name, email } = req.body;
    try {
      // Authenticate or register the user using Google credentials
      const patient = await patientRepository.googleAuth(name, email);
      // Generate and set tokens (access and refresh tokens)
      generateAccessToken({ patientId: patient._id, email: patient.email, name: patient.name }, res);
      generateRefreshToken({ patientId: patient._id, email: patient.email, name: patient.name }, res);
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

      // Generate and set access and refresh tokens
      const accessToken = generateAccessToken({ patientId: patient._id, email: patient.email, name: patient.name }, res);
      const refreshToken = generateRefreshToken({ patientId: patient._id, email: patient.email, name: patient.name }, res);

      return res.status(200).json({ message: 'Login successful', patient });
    } catch (error: any) {
      return res.status(400).json({ message: error.message });
    }
  }

  async getProfile(req: CustomRequest, res: Response): Promise<Response> {
    try {
      const patientId = req.user?.patientId;
      console.log(patientId);
      

      const patient = await patientRepository.findPatientById(patientId)
      if (!patient) {
        console.log('patient not found');
        return res.status(404).json({ message: 'patient not found' });
      }

      return res.status(200).json(patient);
    } catch (error) {
      console.error('Error fetching patient profile:', error);
      // Return 500 if there is a server error
      return res.status(500).json({ message: 'Server error' });
    }
  }
  async updateProfile(req: CustomRequest, res: Response): Promise<Response> {
    try {
      console.log('update profile',req.file);
      
      const patientId = req.user?.patientId; // Assuming req.user has the authenticated doctorI      
      const patient = await patientRepository.findPatientById(patientId);      
      if (!patient) {
        return res.status(404).json({ message: 'patient not found' });
      }      
      let profilePhoto = req.file ? req.file.path : patient.profilePhoto
      console.log('profilephoto',profilePhoto);
      
      const uploadResult = await cloudinary.v2.uploader.upload(profilePhoto);

      const updatedData = {
        name: req.body.name || patient.name,
        email: req.body.email || patient.email,
        age: req.body.age || patient.age,
        location: req.body.location || patient.location,
        profilePhoto: uploadResult.secure_url || patient.profilePhoto || ''
      };

      // Update doctor details in the repository
      const updatedDoctor = await patientRepository.updatePatientProfile(patientId, updatedData);

      return res.status(200).json(updatedDoctor);
    } catch (error) {
      console.error('Error updating doctor profile:', error);
      return res.status(500).json({ message: 'Server error' });
    }
  }
  async getDoctorsNearby(req: Request, res: Response): Promise<Response> {
    try {
      const { lat, lng } = req.query; // Extract latitude and longitude from query params
      if (!lat || !lng) {
        return res.status(400).json({ message: 'Latitude and longitude are required' });
      }
      const latitude = parseFloat(lat as string);
      const longitude = parseFloat(lng as string);
      if (isNaN(latitude) || isNaN(longitude)) {
        return res.status(400).json({ message: 'Invalid latitude or longitude' });
      }
      const doctors = await patientRepository.findDoctorsNearby(latitude, longitude);
      return res.status(200).json(doctors);
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

}

export const patientController = new PatientController();
