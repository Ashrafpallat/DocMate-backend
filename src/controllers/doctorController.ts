import { Request, Response } from 'express';
import { doctorRepository } from '../repositories/doctorRepository';
import bcrypt from 'bcrypt'; 
import jwt from 'jsonwebtoken';

class DoctorController {
  async signup(req: Request, res: Response): Promise<Response> {

    try {
      const { name, email, password, location, experience, gender, specialization } = req.body;      
      const existingDoctor = await doctorRepository.findDoctorByEmail(email);
      if (existingDoctor) {        
        return res.status(400).json({ message: 'Doctor already exists with this email' });
      }
      const newDoctor = await doctorRepository.createDoctor({
        name,
        email,
        password, // Password will be hashed in the pre-save hook
        location,
        experience,
        specialization,
        gender,
      });

      // Return success response
      return res.status(201).json({ message: 'Doctor registered successfully' });
    } catch (error) {
      return res.status(500).json({ message: 'Server error', error });
    }

    
  }

  async login(req: Request, res: Response): Promise<Response> {
    try {
      const { email, password } = req.body;

      const doctor = await doctorRepository.findDoctorByEmail(email);
      if (!doctor) {
        return res.status(400).json({ message: 'Invalid email or password' });
      }
      const isPasswordValid = await bcrypt.compare(password, doctor.password);
      if (!isPasswordValid) {
        return res.status(400).json({ message: 'Invalid email or password' });
      }

      // Generate JWT token for the doctor (assuming 'secretKey' is in your env config)
      const token = jwt.sign({ id: doctor._id, email: doctor.email }, process.env.JWT_SECRET || 'secretKey', {
        expiresIn: '30d', 
      });

      // Return success response with token
      return res.status(200).json({ message: 'Login successful', token });
    } catch (error) {
      return res.status(500).json({ message: 'Server error', error });
    }
  }
}

export const doctorController = new DoctorController();
