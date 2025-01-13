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
exports.doctorRepository = void 0;
const mongoose_1 = __importDefault(require("mongoose"));
const defaultTokenModel_1 = require("../models/defaultTokenModel");
const doctorModel_1 = require("../models/doctorModel");
const prescriptionModel_1 = __importDefault(require("../models/prescriptionModel"));
const verificationModel_1 = __importDefault(require("../models/verificationModel"));
const moment_1 = __importDefault(require("moment"));
const reviewModel_1 = __importDefault(require("../models/reviewModel"));
class DoctorRepository {
    findDoctorByEmail(email) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield doctorModel_1.Doctor.findOne({ email });
        });
    }
    findDoctorbyId(id) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield doctorModel_1.Doctor.findById(id);
        });
    }
    createDoctor(doctorData) {
        return __awaiter(this, void 0, void 0, function* () {
            const doctor = new doctorModel_1.Doctor(doctorData);
            return yield doctor.save();
        });
    }
    // Google authentication: Find or create a patient
    googleAuth(name, email) {
        return __awaiter(this, void 0, void 0, function* () {
            // Check if the doctor already exists
            let doctor = yield this.findDoctorByEmail(email);
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
                doctor = yield this.createDoctor(newDoctorData);
                console.log('doctor created');
            }
            console.log(' doctor exists');
            return doctor; // Return the patient (either found or newly created)
        });
    }
    saveVerificationData(data) {
        return __awaiter(this, void 0, void 0, function* () {
            const verification = new verificationModel_1.default(data);
            yield verification.save();
            return verification;
        });
    }
    updateDoctorProfile(doctorId, updatedData) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield doctorModel_1.Doctor.findByIdAndUpdate(doctorId, updatedData, { new: true });
        });
    }
    findDefaultTokensByDay(day) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield defaultTokenModel_1.DefaultTokenModel.findOne({ day });
        });
    }
    // Save or update default tokens
    saveOrUpdateDefaultTokens(day, tokens, doctorId) {
        return __awaiter(this, void 0, void 0, function* () {
            let defaultTokens = yield defaultTokenModel_1.DefaultTokenModel.findOne({ day, doctorId }).exec();
            if (defaultTokens) {
                defaultTokens.slots = tokens;
            }
            else {
                defaultTokens = new defaultTokenModel_1.DefaultTokenModel({ day, slots: tokens, doctorId });
            }
            return yield defaultTokens.save();
        });
    }
    findSlotsByDoctorId(doctorId) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const today = (0, moment_1.default)().format('dddd');
                return yield defaultTokenModel_1.DefaultTokenModel.find({ doctorId, day: today })
                    .populate({
                    path: 'slots.patientId', // Populate the patientId field inside the slots
                    select: 'name age email gender location' // Specify which patient details to retrieve
                });
            }
            catch (error) {
                console.error('Error finding slots by doctorId:', error);
                throw error;
            }
        });
    }
    savePrescription(symptoms, diagnosis, medications, doctorId, patientId) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const newPrescription = new prescriptionModel_1.default({
                    symptoms,
                    diagnosis,
                    medications,
                    doctorId: new mongoose_1.default.Types.ObjectId(doctorId),
                    patientId: new mongoose_1.default.Types.ObjectId(patientId),
                });
                const savedPrescription = yield newPrescription.save();
                console.log('Prescription saved successfully:');
                const today = (0, moment_1.default)().format('dddd');
                const updateStatus = yield defaultTokenModel_1.DefaultTokenModel.updateMany({
                    doctorId: doctorId,
                    day: today,
                    "slots.patientId": patientId, // Match the specific slot by patientId
                }, {
                    $set: { "slots.$.status": "consulted" }, // Update the status of the matched slot
                });
                // console.log(updateStatus);
                return savedPrescription;
            }
            catch (error) {
                console.error('Error saving prescription:', error);
                throw error;
            }
        });
    }
    getPrescriptionsByDoctorId(doctorId) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield prescriptionModel_1.default.find({ doctorId })
                .populate('patientId', 'name email age gender location profilePhoto')
                .sort({ date: -1 }); // Sort by date in descending order
        });
    }
    getReviews(doctorId) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const reviews = yield reviewModel_1.default.find({ doctorId })
                    .populate('patientId', 'profilePhoto name email age gender location')
                    .sort({ createdAt: -1 });
                return reviews;
            }
            catch (error) {
                console.error("Error fetching reviews from doctor repo:", error);
                throw new Error("Unable to fetch reviews. Please try again later.");
            }
        });
    }
}
exports.doctorRepository = new DoctorRepository();
