import mongoose from 'mongoose';
import { DefaultToken, DefaultTokenModel } from '../models/defaultTokenModel';
import { Doctor } from '../models/doctorModel';
import { Patient } from '../models/patientModel';
import moment from 'moment';
import prescriptionModel from '../models/prescriptionModel';

class PatientRepository {
  async findPatientByEmail(email: string) {
    return await Patient.findOne({ email });
  }

  async createPatient(patientData: any) {
    const patient = new Patient(patientData);
    return await patient.save();
  }

  async findPatientById(id: string) {
    return await Patient.findById(id);
  }

  async updatePatientStatus(id: string, status: 'Active' | 'Blocked') {
    return await Patient.findByIdAndUpdate(id, { status }, { new: true });
  }

  async googleAuth(name: string, email: string) {
    let patient = await this.findPatientByEmail(email);

    if (!patient) {
      const newPatientData = {
        name,
        email,
        age: '',
        gender: '',
        password: '',
      };
      patient = await this.createPatient(newPatientData);
      console.log('user created');

    }

    console.log(' user exists');
    return patient; 
  }
  async updatePatientProfile(patientId: string, updatedData: any) {
    return await Patient.findByIdAndUpdate(patientId, updatedData, { new: true });
  }
  async findDoctorsNearby(lat: number, lng: number, page: number, limit: number) {
    const skip = (page - 1) * limit;

    const totalDoctors = await Doctor.find({
      location: {
        $near: {
          $geometry: {
            type: 'Point',
            coordinates: [lng, lat],
          },
          $maxDistance: 10000, // Set the maximum distance in meters (10 km)
        },
      },
      kycVerified: true,
    })
    let totalCount=totalDoctors.length

    const doctors = await Doctor.find({
      location: {
        $near: {
          $geometry: {
            type: 'Point',
            coordinates: [lng, lat],
          },
          $maxDistance: 10000, 
        },
      },
      kycVerified: true,
    })
      .skip(skip) // Skip the documents of previous pages
      .limit(limit) // Limit the number of documents per page
      .exec(); // Execute the query  
    return {doctors, totalCount};
  }
  
  async reserveSlot(doctorId: mongoose.Schema.Types.ObjectId, day: string, slotIndex: number, patientId: mongoose.Schema.Types.ObjectId) {
    const isBooked = await DefaultTokenModel.findById({ patientId: patientId})
    if(isBooked){
      console.log('');
      
    }
    const defaultToken = await DefaultTokenModel.findOne({ doctorId, day });

    if (!defaultToken) {
      throw new Error("Doctor or day not found.");
    }

    if (slotIndex < 0 || slotIndex >= defaultToken.slots.length) {
      throw new Error("Invalid slot index.");
    }

    defaultToken.slots[slotIndex].status = 'reserved';
    defaultToken.slots[slotIndex].patientId = patientId;

    await defaultToken.save();
    return defaultToken.slots[slotIndex];
  }

  async findPendingAppointments(patientId: string): Promise<DefaultToken[]> {
    try {      
      const today = moment().format('dddd');
      return await DefaultTokenModel.find({
        "slots.patientId": patientId, // Match slots with the given patientId
        "slots.status": { $eq: "reserved" }, // Status is not 'consulted'
        day: today, // Match today's day
      })
        .populate({
          path: "doctorId", // Populate doctor details
          select: "profilePhoto name specialization email contactNumber", // Select desired fields
        });
    } catch (error) {
      console.error("Error finding pending appointments for patient:", error);
      throw error;
    }
  }
  async getPrescriptionsByPatientId(patientId: string){
    return await prescriptionModel.find({ patientId })
    .populate('doctorId', 'name email specialization profilePhoto')
    .sort({ date: -1 }); // Sort by date in descending order
  }

}


export const patientRepository = new PatientRepository();
