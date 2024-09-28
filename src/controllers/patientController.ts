// controllers/patientController.ts
import { Request, Response } from 'express';
import { patientService } from '../services/patientService';
import { patientRepository } from '../repositories/patientRepository';
import { generateAccessToken, generateRefreshToken, verifyToken } from '../utils/generateToken';

class PatientController {

  async refreshAccessToken(req: Request, res: Response): Promise<Response> {
    try {
        const { refreshToken } = req.cookies;
        if (!refreshToken) {
            return res.status(401).json({ message: 'No refresh token provided' });
        }

        const decoded = verifyToken(refreshToken, true); // Verify the refresh token

        // Generate new access token
        const accessToken = generateAccessToken({ patientId: decoded.patientId, email: decoded.email, name: decoded.name });

        // Send the new access token
        res.cookie('accessToken', accessToken, {
            httpOnly: true,
            secure: process.env.NODE_ENV !== 'development',
            maxAge: 15 * 60 * 1000, // 15 minutes
            sameSite: 'none',
            path: '/',
        });

        return res.status(200).json({ message: 'New access token issued' });
    } catch (error: any) {
        return res.status(401).json({ message: 'Invalid refresh token' });
    }
}


  async googleAuth(req: Request, res: Response): Promise<Response> {
    const { name, email } = req.body;
    console.log('at patient controller');

    try {
      const patient = await patientRepository.googleAuth(name, email);

      return res.status(200).json({ message: 'User authenticated', patient });
    } catch (error) {
      console.error('Error processing Google authentication:', error);
      return res.status(500).json({ message: 'Internal server error' });
    }
  };

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

        const accessToken = generateAccessToken({ patientId: patient._id, email: patient.email, name: patient.name });
        const refreshToken = generateRefreshToken({ patientId: patient._id, email: patient.email, name: patient.name });

        // Set Access Token in an HTTP-only cookie
        res.cookie('accessToken', accessToken, {
            httpOnly: true,
            secure: process.env.NODE_ENV !== 'development',
            maxAge: 15 * 60 * 1000, // 15 minutes
            sameSite: 'none',
            path: '/',
        });

        // Set Refresh Token in an HTTP-only cookie
        res.cookie('refreshToken', refreshToken, {
            httpOnly: true,
            secure: process.env.NODE_ENV !== 'development',
            maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
            sameSite: 'none',
            path: '/',
        });

        return res.status(200).json({ message: 'Login successful', patient });
    } catch (error: any) {
        return res.status(400).json({ message: error.message });
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
