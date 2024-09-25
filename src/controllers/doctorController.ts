// controllers/doctorController.ts
import { Request, Response } from 'express';
import { doctorService } from '../services/doctorService';
import { doctorRepository } from '../repositories/doctorRepository';

class DoctorController {

  async googleAuth(req: Request, res: Response): Promise<Response> {
    const { name, email } = req.body;
    console.log('at doctor controller');
  
    try {
      // Use the repository method to find or create the doctor
      
      const doctor = await doctorRepository.googleAuth(name, email);
      
      return res.status(200).json({ message: 'User authenticated', doctor });
    } catch (error) {
      console.error('Error processing Google authentication:', error);
      return res.status(500).json({ message: 'Internal server error' });
    }
  };

  async signup(req: Request, res: Response): Promise<Response> {
    try {
      const { name, email, password, location, experience, gender, specialization } = req.body;

      const newDoctor = await doctorService.registerDoctor({
        name,
        email,
        password,
        location,
        experience,
        gender,
        specialization,
      });

      return res.status(201).json({ message: 'Doctor registered successfully', newDoctor });
    } catch (error: any) {
      return res.status(400).json({ message: error.message });
    }
  }

  async login(req: Request, res: Response): Promise<Response> {
    try {
      const { email, password } = req.body;
      const { doctor, token } = await doctorService.loginDoctor(email, password);

      // Set the token in a cookie
      res.cookie('token', token, {
        httpOnly: true, // Secure the cookie
        secure: process.env.NODE_ENV === 'production', // Only send cookie over HTTPS in production
        maxAge: 30 * 24 * 60 * 60 * 1000, // 30 days
      });

      // Return success response with the doctor and token
      return res.status(200).json({ message: 'Login successful', doctor });
    } catch (error: any) {
      return res.status(400).json({ message: error.message });
    }
  }

  async logout(req: Request, res: Response): Promise<Response> {
    try {
      // Clear the token cookie by setting it with an expired date
      res.cookie('token', '', {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        expires: new Date(0)  // Expire immediately
      });

      return res.status(200).json({ message: 'Logout successful' });
    } catch (error) {
      return res.status(500).json({ message: 'Server error', error });
    }
  }
}

export const doctorController = new DoctorController();
