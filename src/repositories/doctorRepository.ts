import mongoose from 'mongoose';
import { DefaultToken, DefaultTokenModel } from '../models/defaultTokenModel';
import { Doctor } from '../models/doctorModel';
import prescriptionModel, { IPrescription } from '../models/prescriptionModel';
import VerificationRequest from '../models/verificationModel';
import moment from 'moment';
import reviewModel from '../models/reviewModel';

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
    // Check if the doctor already exists
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
      console.log('doctor created');

    }

    console.log(' doctor exists');
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
      defaultTokens.slots = tokens;
    } else {
      defaultTokens = new DefaultTokenModel({ day, slots: tokens, doctorId });
    }
    return await defaultTokens.save();
  }

  async findSlotsByDoctorId(doctorId: string): Promise<DefaultToken[]> {
    try {
      const today = moment().format('dddd');
      return await DefaultTokenModel.find({ doctorId, day: today })
        .populate({
          path: 'slots.patientId', // Populate the patientId field inside the slots
          select: 'name age email gender location' // Specify which patient details to retrieve
        });
    } catch (error) {
      console.error('Error finding slots by doctorId:', error);
      throw error;
    }
  }
  async savePrescription(symptoms: string, diagnosis: string, medications: string, doctorId: string, patientId: string): Promise<IPrescription> {
    try {
      const newPrescription = new prescriptionModel({
        symptoms,
        diagnosis,
        medications,
        doctorId: new mongoose.Types.ObjectId(doctorId),
        patientId: new mongoose.Types.ObjectId(patientId),
      });

      const savedPrescription = await newPrescription.save();
      console.log('Prescription saved successfully:');
      const today = moment().format('dddd');
      const updateStatus = await DefaultTokenModel.updateMany(
        {
          doctorId: doctorId,
          day: today,
          "slots.patientId": patientId, // Match the specific slot by patientId
        },
        {
          $set: { "slots.$.status": "consulted" }, // Update the status of the matched slot
        }
      );
      // console.log(updateStatus);

      return savedPrescription;
    } catch (error) {
      console.error('Error saving prescription:', error);
      throw error;
    }
  }
  async getPrescriptionsByDoctorId(doctorId: string) {
    return await prescriptionModel.find({ doctorId })
      .populate('patientId', 'name email age gender location')
      .sort({ date: -1 }); // Sort by date in descending order
  }
  async getReviews(doctorId: string) {
    try {
      const reviews = await reviewModel.find({ doctorId })
        .populate('patientId', 'profilePhoto name email age gender location') 
        .sort({ createdAt: -1 }); 
  
      return reviews; 
    } catch (error) {
      console.error("Error fetching reviews from doctor repo:", error);
      throw new Error("Unable to fetch reviews. Please try again later.");
    }
  }
  

}



export const doctorRepository = new DoctorRepository();
