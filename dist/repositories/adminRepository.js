"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.adminRepository = void 0;
const dotenv_1 = __importDefault(require("dotenv"));
const patientModel_1 = require("../models/patientModel");
const doctorModel_1 = require("../models/doctorModel");
const prescriptionModel_1 = __importDefault(require("../models/prescriptionModel"));
dotenv_1.default.config();
class AdminRepository {
    findAdminByEmail(email) {
        return __awaiter(this, void 0, void 0, function* () {
            if (email === process.env.ADMIN_EMAIL) {
                return {
                    email: process.env.ADMIN_EMAIL,
                    password: process.env.ADMIN_PASSWORD, // This would be the hashed password in production
                };
            }
            // If no match found, return null
            return null;
        });
    }
    getAllPatients() {
        return __awaiter(this, void 0, void 0, function* () {
            return patientModel_1.Patient.find(); // Fetch all patients
        });
    }
    updatePatientStatus(patientId, status) {
        return __awaiter(this, void 0, void 0, function* () {
            return patientModel_1.Patient.findByIdAndUpdate(patientId, { status }, { new: true }); // Update status (Active, Blocked)
        });
    }
    getAllDoctors() {
        return __awaiter(this, void 0, void 0, function* () {
            return doctorModel_1.Doctor.find();
        });
    }
    // Update the status of a doctor
    updateDoctorStatus(doctorId, status) {
        return __awaiter(this, void 0, void 0, function* () {
            return doctorModel_1.Doctor.findByIdAndUpdate(doctorId, { status }, { new: true } // Return the updated document
            );
        });
    }
    getAllPrescriptions() {
        return __awaiter(this, void 0, void 0, function* () {
            return prescriptionModel_1.default.find();
        });
    }
    getPatientsByMonth(year) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const result = yield patientModel_1.Patient.aggregate([
                    // Match documents for the specific year
                    {
                        $match: {
                            createdAt: {
                                $gte: new Date(`${year}-01-01`),
                                $lt: new Date(`${year + 1}-01-01`),
                            },
                        },
                    },
                    // Project the month from createdAt
                    {
                        $project: {
                            month: { $month: '$createdAt' },
                        },
                    },
                    // Group by month and count patients
                    {
                        $group: {
                            _id: '$month',
                            patientCount: { $sum: 1 },
                        },
                    },
                    // Sort by month in ascending order
                    {
                        $sort: { _id: 1 },
                    },
                ]);
                // Format the result to include month names if needed
                const months = [
                    'January', 'February', 'March', 'April', 'May', 'June',
                    'July', 'August', 'September', 'October', 'November', 'December',
                ];
                const formattedResult = result.map(item => ({
                    month: months[item._id - 1],
                    patientCount: item.patientCount,
                }));
                return formattedResult;
            }
            catch (error) {
                console.error('Error fetching patients by month:', error);
                throw new Error('Unable to fetch patient data');
            }
        });
    }
    getPatientsByYear(years) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const result = yield patientModel_1.Patient.aggregate([
                    // Match documents for the specified years
                    {
                        $match: {
                            createdAt: {
                                $gte: new Date(`${Math.min(...years)}-01-01`),
                                $lt: new Date(`${Math.max(...years) + 1}-01-01`),
                            },
                        },
                    },
                    // Project the year from createdAt
                    {
                        $project: {
                            year: { $year: '$createdAt' },
                        },
                    },
                    // Group by year and count patients
                    {
                        $group: {
                            _id: '$year',
                            patientCount: { $sum: 1 },
                        },
                    },
                    // Sort by year in ascending order
                    {
                        $sort: { _id: 1 },
                    },
                ]);
                // Format the result
                const formattedResult = result.map(item => ({
                    year: item._id,
                    patientCount: item.patientCount,
                }));
                return formattedResult;
            }
            catch (error) {
                console.error('Error fetching patients by year:', error);
                throw new Error('Unable to fetch patient data');
            }
        });
    }
    getDoctorsByMonth(year) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const result = yield doctorModel_1.Doctor.aggregate([
                    {
                        $match: {
                            createdAt: {
                                $gte: new Date(`${year}-01-01T00:00:00Z`),
                                $lt: new Date(`${year + 1}-01-01T00:00:00Z`),
                            },
                        },
                    },
                    {
                        $group: {
                            _id: { $month: '$createdAt' },
                            doctorCount: { $sum: 1 },
                        },
                    },
                    {
                        $sort: { _id: 1 },
                    },
                ]);
                // Map the result to include month names
                const months = [
                    'January', 'February', 'March', 'April', 'May', 'June',
                    'July', 'August', 'September', 'October', 'November', 'December',
                ];
                const formattedResult = result.map(item => ({
                    month: months[item._id - 1], // Convert month number to month name
                    doctorCount: item.doctorCount, // Keep the doctor count
                }));
                return formattedResult;
            }
            catch (error) {
                console.error('Error fetching doctors by month:', error);
                throw error;
            }
        });
    }
    getDoctorsByYear(years) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const result = yield doctorModel_1.Doctor.aggregate([
                    {
                        $match: {
                            createdAt: {
                                $gte: new Date(`${years[0]}-01-01`), // Match documents from the first day of the provided year
                                $lt: new Date(`${years[0] + 1}-01-01`), // Match documents before the first day of the next year
                            },
                        },
                    },
                    {
                        $group: {
                            _id: { $year: '$createdAt' }, // Group by the year of the createdAt field
                            doctorCount: { $sum: 1 }, // Count the number of doctors per year
                        },
                    },
                    {
                        $sort: { _id: 1 }, // Sort by year in ascending order
                    },
                ]);
                // Map the result to return year and doctorCount
                const formattedResult = result.map(item => ({
                    year: item._id, // The _id will contain the year
                    doctorCount: item.doctorCount, // The count of doctors for that year
                }));
                return formattedResult;
            }
            catch (error) {
                console.error('Error fetching doctors by year:', error);
                throw error;
            }
        });
    }
}
exports.adminRepository = new AdminRepository();
