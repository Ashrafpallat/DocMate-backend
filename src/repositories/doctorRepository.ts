import { DefaultToken, DefaultTokenModel } from '../models/defaultTokenModel';
import { Doctor } from '../models/doctorModel';
import VerificationRequest from '../models/verificationModel';
import moment from 'moment';

class DoctorRepository {
  async findDoctorByEmail(email: string) {
    return await Doctor.findOne({ email });
  }
  async findDoctorbyId(id: string) {
    return await Doctor.findById(id)
  }

  async createDoctor(doctorData: any) {
    const doctor = new Doctor(doctorData);
    return await doctor.save();
  }

  // Google authentication: Find or create a patient
  async googleAuth(name: string, email: string) {
    // Check if the patient already exists
    let doctor = await this.findDoctorByEmail(email);

    // If not, create a new doctor
    if (!doctor) {
      const newDoctorData = {
        name,
        email,
        age: '',
        gender: '',
        password: '',
        // Include any other default fields you want to set
      };
      doctor = await this.createDoctor(newDoctorData);
      console.log('user created');

    }

    console.log(' user exists');
    return doctor; // Return the patient (either found or newly created)
  }

  async saveVerificationData(data: { name: string; regNo: string; yearOfReg: string; medicalCouncil: string; proofFile: string }) {
    const verification = new VerificationRequest(data);
    await verification.save();
    return verification;
  }
  async updateDoctorProfile(doctorId: string, updatedData: any) {
    return await Doctor.findByIdAndUpdate(doctorId, updatedData, { new: true });
  }

  async findDefaultTokensByDay(day: string): Promise<DefaultToken | null> {
    return await DefaultTokenModel.findOne({ day });
  }
  // Save or update default tokens
  async saveOrUpdateDefaultTokens(day: string, tokens: any[], doctorId: string): Promise<DefaultToken> {
    let defaultTokens = await DefaultTokenModel.findOne({ day, doctorId }).exec();

    if (defaultTokens) {
      // Update existing tokens for the doctor on that day
      defaultTokens.slots = tokens;
    } else {
      // Create a new entry if no tokens exist for that day and doctor
      defaultTokens = new DefaultTokenModel({ day, slots: tokens, doctorId });
    }
    return await defaultTokens.save();
  }

  async findSlotsByDoctorId(doctorId: string): Promise<DefaultToken[]> {
    try {      
      const today = moment().format('dddd'); // Get current day (e.g., 'Monday')
      return await DefaultTokenModel.find({ doctorId, day: today });
    } catch (error) {
      console.error('Error finding slots by doctorId:', error);
      throw error;
    }
  }
  

}



export const doctorRepository = new DoctorRepository();
