// controllers/patientController.ts
import { Request, Response } from 'express';
import { patientService } from '../services/patientService';

class PatientController {

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
      const { patient, token } = await patientService.loginPatient(email, password);

      // Set the token in a cookie
      res.cookie('token', token, {
        httpOnly: true, // Secure the cookie
        secure: process.env.NODE_ENV === 'production', // Only send cookie over HTTPS in production
        maxAge: 30 * 24 * 60 * 60 * 1000, // 30 days
      });

      // Return success response with the patient and token
      return res.status(200).json({ message: 'Login successful', patient });
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

export const patientController = new PatientController();
