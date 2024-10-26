import { Doctor } from '../models/doctorModel';
import { Patient } from '../models/patientModel';

class PatientRepository {
  // Find patient by email
  async findPatientByEmail(email: string) {
    return await Patient.findOne({ email });
  }

  // Create a new patient
  async createPatient(patientData: any) {
    const patient = new Patient(patientData);
    return await patient.save();
  }

  // Find patient by ID
  async findPatientById(id: string) {
    return await Patient.findById(id);
  }

  // Update patient status (active/blocked)
  async updatePatientStatus(id: string, status: 'Active' | 'Blocked') {
    return await Patient.findByIdAndUpdate(id, { status }, { new: true });
  }

  // Google authentication: Find or create a patient
  async googleAuth(name: string, email: string) {
    // Check if the patient already exists
    let patient = await this.findPatientByEmail(email);

    // If not, create a new patient
    if (!patient) {
      const newPatientData = {
        name,
        email,
        age: '',
        gender: '',
        password: '',
        // Include any other default fields you want to set
      };
      patient = await this.createPatient(newPatientData);
      console.log('user created');

    }

    console.log(' user exists');
    return patient; // Return the patient (either found or newly created)
  }
  async updatePatientProfile(patientId: string, updatedData: any) {
    return await Patient.findByIdAndUpdate(patientId, updatedData, { new: true });
  }
  async findDoctorsNearby(lat: number, lng: number, page: number, limit: number) {
    const skip = (page - 1) * limit;
    console.log('at repo');

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
          $maxDistance: 10000, // Set the maximum distance in meters (10 km)
        },
      },
      kycVerified: true,
    })
      .skip(skip) // Skip the documents of previous pages
      .limit(limit) // Limit the number of documents per page
      .exec(); // Execute the query  
    return {doctors, totalCount};
  }


}


export const patientRepository = new PatientRepository();
