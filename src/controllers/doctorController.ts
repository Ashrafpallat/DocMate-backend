// controllers/doctorController.ts
import { Request, Response } from 'express';
import { doctorService } from '../services/doctorService';
import { doctorRepository } from '../repositories/doctorRepository';
import VerificationRequest from '../models/verificationRequests';
import cloudinary from '../config/cloudinery';

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
  async verifyDoctor(req: Request, res: Response): Promise<Response> {
    const { name, regNo, yearOfReg, medicalCouncil } = req.body;
    const proofFile = req.file; // Access the uploaded file from the request

    if (!proofFile) {
      return res.status(400).json({ message: 'Proof file is required' });
    }

    try {
      // Upload the proof file to Cloudinary (or your chosen service)
      const uploadResult = await cloudinary.v2.uploader.upload(proofFile.path);
      const doctorId = req.user.id;
       
      // Create the verification data object
      const verificationData = {
        name,
        regNo,
        yearOfReg,
        medicalCouncil,
        proofFile: uploadResult.secure_url, // Save the URL of the uploaded file
        doctorId
      };

      // Save verification data to the database
      const verification = await this.saveVerificationData(verificationData);
      
      return res.status(201).json({ message: 'Verification request submitted successfully', verification });
    } catch (error) {
      console.error('Error during verification:', error);
      return res.status(500).json({ message: 'Internal server error' });
    }
  }

  async saveVerificationData(data: { name: string; regNo: string; yearOfReg: string; medicalCouncil: string; proofFile: string }) {
    const verification = new VerificationRequest(data);
    await verification.save();
    return verification;
  }
}

export const doctorController = new DoctorController();
