// controllers/doctorController.ts
import { Request, Response } from 'express';
import { doctorService } from '../services/doctorService';
import { doctorRepository } from '../repositories/doctorRepository';
import VerificationRequest from '../models/verificationModel';
import cloudinary from '../config/cloudinery';
import { generateAccessToken, generateRefreshToken } from '../utils/generateToken';
import { HttpStatus } from '../utils/HttpStatus'; // Import the HttpStatus enum

interface CustomRequest extends Request {
  user?: String | any
}
class DoctorController {

  async googleAuth(req: Request, res: Response): Promise<Response> {
    const { name, email } = req.body;

    try {
      const doctor = await doctorRepository.googleAuth(name, email); 
      if(doctor.status === 'Blocked'){
        return res.status(403).json({ message: 'Your account has been blocked.' });
      }     
      const accessToken = generateAccessToken({ userId: doctor._id, email: doctor.email, name: doctor.name }, res);
      const refreshToken = generateRefreshToken({ userId: doctor._id, email: doctor.email, name: doctor.name }, res);
      console.log('access token----', accessToken);
      console.log('refresh token----', refreshToken);      
      return res.status(200).json({ message: 'User authenticated', doctor });
    } catch (error) {
      console.error('Error processing Google authentication:', error);
      return res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({ message: 'Internal server error' });
    }
  };

  async signup(req: Request, res: Response): Promise<Response> {
    try {
      const {
        name,
        email,
        password,
        locationName,
        latitude,
        longitude,
        experience,
        gender,
        specialization,
      } = req.body;

      // Create the location object in the format required by MongoDB's GeoJSON schema
      const location = {
        type: 'Point',
        coordinates: [parseFloat(longitude), parseFloat(latitude)] // [longitude, latitude]
      };

      // Call the doctor service to register a new doctor
      const newDoctor = await doctorService.registerDoctor({
        name,
        email,
        password,
        locationName,
        location, // Pass the location object
        experience,
        gender,
        specialization,
      });

      return res.status(HttpStatus.CREATED).json({
        message: 'Doctor registered successfully',
        doctor: newDoctor,
      });
    } catch (error) {
      console.log('error occured during signup', error);
      return res.status(HttpStatus.BAD_REQUEST).json({ message: 'Internal server error' });
    }
  };

  async login(req: Request, res: Response): Promise<Response> {
    try {
      const { email, password } = req.body;
      const { doctor } = await doctorService.loginDoctor(email, password);
      if(doctor.status === 'Blocked'){
        return res.status(403).json({ message: 'Your account has been blocked.' });
      }
      const accessToken = generateAccessToken({ userId: doctor._id, email: doctor.email, name: doctor.name }, res);
      const refreshToken = generateRefreshToken({ userId: doctor._id, email: doctor.email, name: doctor.name }, res);

      // Return success response with the doctor and token
      return res.status(HttpStatus.OK).json({ message: 'Login successful', doctor });
    } catch (error: any) {
      return res.status(HttpStatus.BAD_REQUEST).json({ message: error.message });
    }
  }
  async logout(req: Request, res: Response): Promise<Response> {
    try {
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

      return res.status(HttpStatus.OK).json({ message: 'Logout successful' });
    } catch (error) {
      return res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({ message: 'Server error', error });
    }
  }
  async verifyDoctor(req: CustomRequest, res: Response): Promise<Response> {
    const { name, regNo, yearOfReg, medicalCouncil } = req.body;
    const proofFile = req.file; // Access the uploaded file from the request

    if (!proofFile) {
      return res.status(HttpStatus.BAD_REQUEST).json({ message: 'Proof file is required' });
    }

    try {
      // Upload the proof file to Cloudinary (or your chosen service)
      const uploadResult = await cloudinary.v2.uploader.upload(proofFile.path);
      const doctorId = req.user.userId
        ;

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

      return res.status(HttpStatus.CREATED).json({ message: 'Verification request submitted successfully', verification });
    } catch (error) {
      console.error('Error during verification:', error);
      return res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({ message: 'Internal server error' });
    }
  }

  async saveVerificationData(data: { name: string; regNo: string; yearOfReg: string; medicalCouncil: string; proofFile: string }) {
    try {
      const verification = new VerificationRequest(data);
      await verification.save();
      return verification;
    } catch (error) {
      console.log('Error at controller', error);
    }
  }
  async getProfile(req: CustomRequest, res: Response): Promise<Response> {
    try {
      const doctorId = req.user?.userId;
      console.log('doctor id frm doc ctrlr',doctorId);
      
      const doctor = await doctorRepository.findDoctorbyId(doctorId)
      if (!doctor) {
        return res.status(HttpStatus.NOT_FOUND).json({ message: 'Doctor not found' });
      }

      return res.status(HttpStatus.OK).json(doctor);
    } catch (error) {
      console.error('Error fetching doctor profile:', error);
      return res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({ message: 'Server error' });
    }
  }
  async updateProfile(req: CustomRequest, res: Response): Promise<Response> {
    try {
      console.log('update profile', req.file);

      const doctorId = req.user?.userId; // Assuming req.user has the authenticated doctorI      
      const doctor = await doctorRepository.findDoctorbyId(doctorId);
      if (!doctor) {
        return res.status(HttpStatus.NOT_FOUND).json({ message: 'Doctor not found' });
      }
      let profilePhoto = req.file ? req.file.path : doctor.profilePhoto
      console.log('profilephoto', profilePhoto);

      const uploadResult = await cloudinary.v2.uploader.upload(profilePhoto);

      const updatedData = {
        name: req.body.name || doctor.name,
        email: req.body.email || doctor.email,
        age: req.body.age || doctor.age,
        specialization: req.body.specialization || doctor.specialization,
        fees: req.body.fees || doctor.fees,
        locationName: req.body.location || doctor.locationName,
        location: {
          type: 'Point',
          coordinates: [
            parseFloat(req.body.longitude) || doctor.location?.coordinates[0], // Longitude
            parseFloat(req.body.latitude) || doctor.location?.coordinates[1]  // Latitude
          ],
        },
        profilePhoto: uploadResult.secure_url || doctor.profilePhoto || ''
      };

      // Update doctor details in the repository
      const updatedDoctor = await doctorRepository.updateDoctorProfile(doctorId, updatedData);

      return res.status(HttpStatus.OK).json(updatedDoctor);
    } catch (error) {
      console.error('Error updating doctor profile:', error);
      return res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({ message: 'Server error' });
    }
  }

  async saveDefaultTokens(req: CustomRequest, res: Response): Promise<Response> {
    try {
      const { selectedDay, slots } = req.body;
      const doctorId = req.user?.userId; // Assuming req.user has the authenticated doctorI      

      const defaultTokens = await doctorService.saveDefaultTokens(selectedDay, slots, doctorId);

      return res.status(HttpStatus.OK).json({
        message: `Default tokens for ${selectedDay} saved successfully`,
        defaultTokens
      });
    } catch (error) {
      console.error('Error saving default tokens:', error);
      return res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({ message: 'Internal server error' });
    }
  }
  async getDoctorSlots(req: CustomRequest, res: Response): Promise<void> {
    try {
      let { doctorId } = req.params
      if (!doctorId) {
        doctorId = req.user?.userId;
      }
      const slots = await doctorService.getDoctorSlots(doctorId);
      res.status(HttpStatus.OK).json(slots);
    } catch (error) {
      console.error('Error fetching slots:', error);
      res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({ message: error || 'Server error. Could not fetch slots.' });
    }
  };

  async savePrescription(req: CustomRequest, res: Response): Promise<Response> {
    try {
      const { symptoms, diagnosis, medications, patientId } = req.body;
      const doctorId = req.user?.userId;       

      if (!doctorId) {
        return res.status(HttpStatus.BAD_REQUEST).json({ message: 'Doctor ID is missing.' });
      }

      const prescription = await doctorRepository.savePrescription(symptoms, diagnosis, medications, doctorId, patientId);
      return res.status(HttpStatus.CREATED).json({
        message: 'Prescription saved successfully',
        prescription,
      });
    } catch (error) {
      console.error('Error saving prescription:', error);
      return res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({ message: 'Internal server error' });
    }
  }

}

export const doctorController = new DoctorController();
