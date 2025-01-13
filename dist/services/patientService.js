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
exports.patientService = void 0;
const bcrypt_1 = __importDefault(require("bcrypt"));
const patientRepository_1 = require("../repositories/patientRepository");
class PatientService {
    // Register a new patient
    registerPatient(patientData) {
        return __awaiter(this, void 0, void 0, function* () {
            const existingPatient = yield patientRepository_1.patientRepository.findPatientByEmail(patientData.email);
            if (existingPatient) {
                throw new Error('User already exists with this email');
            }
            // Create a new patient in the repository
            const newPatient = yield patientRepository_1.patientRepository.createPatient(Object.assign({}, patientData));
            return newPatient;
        });
    }
    // Login a patient
    loginPatient(email, password) {
        return __awaiter(this, void 0, void 0, function* () {
            const patient = yield patientRepository_1.patientRepository.findPatientByEmail(email);
            if (!patient) {
                throw new Error('Invalid email or password');
            }
            const isPasswordValid = yield bcrypt_1.default.compare(password, patient.password);
            if (!isPasswordValid) {
                throw new Error('Invalid email or password');
            }
            return { patient };
        });
    }
    // Fetch pending appointments for a patient
    findPendingAppointments(patientId) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const pendingAppointments = yield patientRepository_1.patientRepository.findPendingAppointments(patientId);
                return pendingAppointments;
            }
            catch (error) {
                console.error('Error fetching pending appointments:', error);
                throw new Error('Could not fetch pending appointments');
            }
        });
    }
    // Get prescriptions by patient ID
    getPrescriptionsByPatientId(patientId) {
        return __awaiter(this, void 0, void 0, function* () {
            if (!patientId)
                throw new Error('Patient ID is required');
            const prescriptions = yield patientRepository_1.patientRepository.getPrescriptionsByPatientId(patientId);
            return prescriptions;
        });
    }
    addReviewAndRating(patientId, doctorId, rating, review) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const result = patientRepository_1.patientRepository.addReviewAndRating(patientId, doctorId, rating, review);
                return result;
            }
            catch (error) {
                console.log(error);
            }
        });
    }
}
// Export an instance of the class
exports.patientService = new PatientService();
