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
exports.patientRepository = void 0;
const defaultTokenModel_1 = require("../models/defaultTokenModel");
const doctorModel_1 = require("../models/doctorModel");
const patientModel_1 = require("../models/patientModel");
const moment_1 = __importDefault(require("moment"));
const prescriptionModel_1 = __importDefault(require("../models/prescriptionModel"));
const reviewModel_1 = __importDefault(require("../models/reviewModel"));
class PatientRepository {
    findPatientByEmail(email) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield patientModel_1.Patient.findOne({ email });
        });
    }
    createPatient(patientData) {
        return __awaiter(this, void 0, void 0, function* () {
            const patient = new patientModel_1.Patient(patientData);
            console.log('user created');
            return yield patient.save();
        });
    }
    findPatientById(id) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield patientModel_1.Patient.findById(id);
        });
    }
    updatePatientStatus(id, status) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield patientModel_1.Patient.findByIdAndUpdate(id, { status }, { new: true });
        });
    }
    googleAuth(name, email) {
        return __awaiter(this, void 0, void 0, function* () {
            let patient = yield this.findPatientByEmail(email);
            if (!patient) {
                const newPatientData = {
                    name,
                    email,
                    age: '',
                    gender: '',
                    password: '',
                };
                patient = yield this.createPatient(newPatientData);
                console.log('user created');
            }
            console.log(' user exists');
            return patient;
        });
    }
    updatePatientProfile(patientId, updatedData) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield patientModel_1.Patient.findByIdAndUpdate(patientId, updatedData, { new: true });
        });
    }
    findDoctorsNearby(lat, lng, page, limit) {
        return __awaiter(this, void 0, void 0, function* () {
            const skip = (page - 1) * limit;
            const totalDoctors = yield doctorModel_1.Doctor.find({
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
            });
            let totalCount = totalDoctors.length;
            const doctors = yield doctorModel_1.Doctor.find({
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
            return { doctors, totalCount };
        });
    }
    reserveSlot(doctorId, day, slotIndex, patientId) {
        return __awaiter(this, void 0, void 0, function* () {
            const defaultToken = yield defaultTokenModel_1.DefaultTokenModel.findOne({ doctorId, day });
            if (!defaultToken) {
                throw new Error("Doctor or day not found.");
            }
            if (slotIndex < 0 || slotIndex >= defaultToken.slots.length) {
                throw new Error("Invalid slot index.");
            }
            console.log('patient id at patient repo resrveSlot', patientId);
            defaultToken.slots[slotIndex].status = 'reserved';
            defaultToken.slots[slotIndex].patientId = patientId;
            yield defaultToken.save();
            return defaultToken.slots[slotIndex];
        });
    }
    findPendingAppointments(patientId) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const today = (0, moment_1.default)().format('dddd');
                return yield defaultTokenModel_1.DefaultTokenModel.find({
                    "slots.patientId": patientId, // Match slots with the given patientId
                    "slots.status": { $eq: "reserved" }, // Status is not 'consulted'
                    day: today, // Match today's day
                })
                    .populate({
                    path: "doctorId", // Populate doctor details
                    select: "profilePhoto name specialization email contactNumber", // Select desired fields
                });
            }
            catch (error) {
                console.error("Error finding pending appointments for patient:", error);
                throw error;
            }
        });
    }
    getPrescriptionsByPatientId(patientId) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield prescriptionModel_1.default.find({ patientId })
                .populate('doctorId', 'name email specialization profilePhoto')
                .sort({ date: -1 }); // Sort by date in descending order
        });
    }
    addReviewAndRating(patientId, doctorId, rating, review) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                // Check if the patient has any prescriptions for the given doctor
                const hasConsultedDoctor = yield prescriptionModel_1.default.findOne({
                    patientId,
                    doctorId,
                });
                if (!hasConsultedDoctor) {
                    throw new Error('You can only review a doctor after a consultation.');
                }
                // Create a new review
                const newReview = new reviewModel_1.default({
                    doctorId,
                    patientId,
                    rating,
                    review,
                });
                // Save the review to the database
                const savedReview = yield newReview.save();
                // Optionally, you can update the doctor's average rating here
                // const reviews = await reviewModel.find({ doctorId });
                // const averageRating =reviews.reduce((sum: number, r: { rating: any; }) => sum + r.rating, 0) / reviews.length;
                return {
                    message: 'Review added successfully!',
                    review: savedReview,
                };
            }
            catch (error) {
                console.log('error from addReviewAndRating frm patient repo', error);
            }
        });
    }
}
exports.patientRepository = new PatientRepository();
