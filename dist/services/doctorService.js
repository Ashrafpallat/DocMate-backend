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
exports.doctorService = void 0;
const bcrypt_1 = __importDefault(require("bcrypt"));
const doctorRepository_1 = require("../repositories/doctorRepository");
class DoctorService {
    // Register a new doctor
    registerDoctor(doctorData) {
        return __awaiter(this, void 0, void 0, function* () {
            const existingDoctor = yield doctorRepository_1.doctorRepository.findDoctorByEmail(doctorData.email);
            if (existingDoctor) {
                throw new Error('Doctor already exists with this email');
            }
            // Create a new doctor in the repository
            const newDoctor = yield doctorRepository_1.doctorRepository.createDoctor(Object.assign({}, doctorData));
            return newDoctor;
        });
    }
    // Login a doctor
    loginDoctor(email, password) {
        return __awaiter(this, void 0, void 0, function* () {
            const doctor = yield doctorRepository_1.doctorRepository.findDoctorByEmail(email);
            if (!doctor) {
                throw new Error('Invalid email or password');
            }
            const isPasswordValid = yield bcrypt_1.default.compare(password, doctor.password);
            if (!isPasswordValid) {
                throw new Error('Invalid email or password');
            }
            return { doctor };
        });
    }
    // Save or update default tokens for a specific day and doctor
    saveDefaultTokens(day, tokens, doctorId) {
        return __awaiter(this, void 0, void 0, function* () {
            // Business logic for token validation can be added here
            const savedTokens = yield doctorRepository_1.doctorRepository.saveOrUpdateDefaultTokens(day, tokens, doctorId);
            return savedTokens;
        });
    }
    // Get all slots for a specific doctor
    getDoctorSlots(doctorId) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                return yield doctorRepository_1.doctorRepository.findSlotsByDoctorId(doctorId);
            }
            catch (error) {
                console.error('Error in doctor service:', error);
                throw error;
            }
        });
    }
    getPrescriptionsByDoctortId(doctorId) {
        return __awaiter(this, void 0, void 0, function* () {
            if (!doctorId) {
                throw new Error('doctor ID is required');
            }
            const prescriptions = yield doctorRepository_1.doctorRepository.getPrescriptionsByDoctorId(doctorId);
            if (!prescriptions || prescriptions.length === 0) {
                throw new Error('No prescriptions found for this doctor');
            }
            return prescriptions;
        });
    }
    getReviewsByDoctorId(doctorId) {
        return __awaiter(this, void 0, void 0, function* () {
            if (!doctorId) {
                throw new Error('Doctor ID is required');
            }
            const reviews = yield doctorRepository_1.doctorRepository.getReviews(doctorId);
            return reviews;
        });
    }
}
exports.doctorService = new DoctorService();
