import { Doctor } from '../models/doctorModel';

class DoctorRepository {
  async findDoctorByEmail(email: string) {
    return await Doctor.findOne({ email });
  }

  async createDoctor(doctorData: any) {
    const doctor = new Doctor(doctorData);
    return await doctor.save();
  }
}

export const doctorRepository = new DoctorRepository();
