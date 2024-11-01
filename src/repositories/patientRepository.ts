import mongoose from 'mongoose';
import { DefaultTokenModel } from '../models/defaultTokenModel';
import { Doctor } from '../models/doctorModel';
import { Patient } from '../models/patientModel';

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

}


export const patientRepository = new PatientRepository();
