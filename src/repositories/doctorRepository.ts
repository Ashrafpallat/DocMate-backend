import { Doctor } from '../models/doctorModel';

class DoctorRepository {
  async findDoctorByEmail(email: string) {
    return await Doctor.findOne({ email });
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
        age:'',
        gender:'',
        password:'',
        // Include any other default fields you want to set
      };
      doctor = await this.createDoctor(newDoctorData);
      console.log('user created');
      
    }
    
    console.log(' user exists');
    return doctor; // Return the patient (either found or newly created)
  }

}



export const doctorRepository = new DoctorRepository();
