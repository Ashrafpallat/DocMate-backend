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
exports.doctorController = void 0;
const doctorService_1 = require("../services/doctorService");
const doctorRepository_1 = require("../repositories/doctorRepository");
const verificationModel_1 = __importDefault(require("../models/verificationModel"));
const cloudinery_1 = __importDefault(require("../config/cloudinery"));
const generateToken_1 = require("../utils/generateToken");
const HttpStatus_1 = require("../utils/HttpStatus"); // Import the HttpStatus enum
const doctorMessages_1 = require("../utils/doctorMessages");
class DoctorController {
    googleAuth(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const { name, email } = req.body;
            try {
                const doctor = yield doctorRepository_1.doctorRepository.googleAuth(name, email);
                if (doctor.status === 'Blocked') {
                    return res.status(403).json({ message: doctorMessages_1.Messages.Errors.ACCOUNT_BLOCKED });
                }
                const accessToken = (0, generateToken_1.generateAccessToken)({ userId: doctor._id, email: doctor.email, name: doctor.name, role: doctor.role }, res);
                const refreshToken = (0, generateToken_1.generateRefreshToken)({ userId: doctor._id, email: doctor.email, name: doctor.name, role: doctor.role }, res);
                return res.status(200).json({ message: doctorMessages_1.Messages.Doctor.AUTH_SUCCESS, doctor });
            }
            catch (error) {
                console.error('Error processing Google authentication:', error);
                return res.status(HttpStatus_1.HttpStatus.INTERNAL_SERVER_ERROR).json({ message: doctorMessages_1.Messages.Errors.INTERNAL_SERVER_ERROR });
            }
        });
    }
    ;
    signup(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { name, email, password, locationName, latitude, longitude, experience, gender, specialization, } = req.body;
                // Create the location object in the format required by MongoDB's GeoJSON schema
                const location = {
                    type: 'Point',
                    coordinates: [parseFloat(longitude), parseFloat(latitude)] // [longitude, latitude]
                };
                // Call the doctor service to register a new doctor
                const newDoctor = yield doctorService_1.doctorService.registerDoctor({
                    name,
                    email,
                    password,
                    locationName,
                    location, // Pass the location object
                    experience,
                    gender,
                    specialization,
                });
                return res.status(HttpStatus_1.HttpStatus.CREATED).json({
                    message: doctorMessages_1.Messages.Doctor.SIGNUP_SUCCESS,
                    doctor: newDoctor,
                });
            }
            catch (error) {
                console.log('error occured during signup', error);
                return res.status(HttpStatus_1.HttpStatus.BAD_REQUEST).json({ message: doctorMessages_1.Messages.Errors.INTERNAL_SERVER_ERROR });
            }
        });
    }
    ;
    login(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { email, password } = req.body;
                const { doctor } = yield doctorService_1.doctorService.loginDoctor(email, password);
                if (doctor.status === 'Blocked') {
                    return res.status(403).json({ message: doctorMessages_1.Messages.Errors.ACCOUNT_BLOCKED });
                }
                const accessToken = (0, generateToken_1.generateAccessToken)({ userId: doctor._id, email: doctor.email, name: doctor.name, role: doctor.role }, res);
                const refreshToken = (0, generateToken_1.generateRefreshToken)({ userId: doctor._id, email: doctor.email, name: doctor.name, role: doctor.role }, res);
                // Return success response with the doctor and token
                return res.status(HttpStatus_1.HttpStatus.OK).json({ message: doctorMessages_1.Messages.Doctor.LOGIN_SUCCESS, doctor });
            }
            catch (error) {
                return res.status(HttpStatus_1.HttpStatus.BAD_REQUEST).json({ message: error.message });
            }
        });
    }
    logout(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                res.cookie('accessToken', '', {
                    httpOnly: true,
                    secure: process.env.NODE_ENV !== 'development',
                    expires: new Date(0), // Expire immediately
                    sameSite: 'none',
                    path: '/', // Ensure the path is the same
                });
                // Clear the refresh token by setting an expired date and consistent properties
                res.cookie('refreshToken', '', {
                    httpOnly: true,
                    secure: process.env.NODE_ENV !== 'development',
                    expires: new Date(0), // Expire immediately
                    sameSite: 'none',
                    path: '/', // Ensure the path is the same
                });
                return res.status(HttpStatus_1.HttpStatus.OK).json({ message: doctorMessages_1.Messages.Doctor.LOGOUT_SUCCESS });
            }
            catch (error) {
                return res.status(HttpStatus_1.HttpStatus.INTERNAL_SERVER_ERROR).json({ message: doctorMessages_1.Messages.Errors.INTERNAL_SERVER_ERROR, error });
            }
        });
    }
    verifyDoctor(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const { name, regNo, yearOfReg, medicalCouncil } = req.body;
            const proofFile = req.file; // Access the uploaded file from the request
            if (!proofFile) {
                return res.status(HttpStatus_1.HttpStatus.BAD_REQUEST).json({ message: doctorMessages_1.Messages.Errors.PROOF_FILE_REQUIRED });
            }
            try {
                // Upload the proof file to Cloudinary (or your chosen service)
                const uploadResult = yield cloudinery_1.default.v2.uploader.upload(proofFile.path);
                const doctorId = req.user.userId;
                // Create the verification data object
                const verificationData = {
                    name,
                    regNo,
                    yearOfReg,
                    medicalCouncil,
                    proofFile: uploadResult.secure_url, // Save the URL of the uploaded file
                    doctorId
                };
                // Save verification data to the database
                const verification = yield this.saveVerificationData(verificationData);
                return res.status(HttpStatus_1.HttpStatus.CREATED).json({ message: doctorMessages_1.Messages.Doctor.VERIFICATION_REQUEST_SUCCESS, verification });
            }
            catch (error) {
                console.error('Error during verification:', error);
                return res.status(HttpStatus_1.HttpStatus.INTERNAL_SERVER_ERROR).json({ message: doctorMessages_1.Messages.Errors.INTERNAL_SERVER_ERROR });
            }
        });
    }
    saveVerificationData(data) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const verification = new verificationModel_1.default(data);
                yield verification.save();
                return verification;
            }
            catch (error) {
                console.log('Error at controller', error);
            }
        });
    }
    getProfile(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            var _a;
            try {
                const doctorId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.userId;
                console.log('doctor id frm doc ctrlr', doctorId);
                const doctor = yield doctorRepository_1.doctorRepository.findDoctorbyId(doctorId);
                if (!doctor) {
                    return res.status(HttpStatus_1.HttpStatus.UNAUTHORIZED).json({ message: doctorMessages_1.Messages.Errors.DOCTOR_NOT_FOUND });
                }
                return res.status(HttpStatus_1.HttpStatus.OK).json(doctor);
            }
            catch (error) {
                console.error('Error fetching doctor profile:', error);
                return res.status(HttpStatus_1.HttpStatus.INTERNAL_SERVER_ERROR).json({ message: doctorMessages_1.Messages.Errors.INTERNAL_SERVER_ERROR });
            }
        });
    }
    updateProfile(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            var _a, _b, _c;
            try {
                console.log('update profile', req.file);
                const doctorId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.userId;
                const doctor = yield doctorRepository_1.doctorRepository.findDoctorbyId(doctorId);
                if (!doctor) {
                    return res.status(HttpStatus_1.HttpStatus.NOT_FOUND).json({ message: doctorMessages_1.Messages.Errors.DOCTOR_NOT_FOUND });
                }
                let profilePhoto = req.file ? req.file.path : doctor.profilePhoto;
                console.log('profilephoto', profilePhoto);
                const uploadResult = yield cloudinery_1.default.v2.uploader.upload(profilePhoto);
                const updatedData = {
                    name: req.body.name || doctor.name,
                    email: req.body.email || doctor.email,
                    age: req.body.age || doctor.age,
                    specialization: req.body.specialization || doctor.specialization,
                    fees: req.body.fees || doctor.fees,
                    locationName: req.body.location || doctor.locationName,
                    location: {
                        type: 'Point',
                        coordinates: [
                            parseFloat(req.body.longitude) || ((_b = doctor.location) === null || _b === void 0 ? void 0 : _b.coordinates[0]), // Longitude
                            parseFloat(req.body.latitude) || ((_c = doctor.location) === null || _c === void 0 ? void 0 : _c.coordinates[1]) // Latitude
                        ],
                    },
                    profilePhoto: uploadResult.secure_url || doctor.profilePhoto || ''
                };
                // Update doctor details in the repository
                const updatedDoctor = yield doctorRepository_1.doctorRepository.updateDoctorProfile(doctorId, updatedData);
                return res.status(HttpStatus_1.HttpStatus.OK).json(updatedDoctor);
            }
            catch (error) {
                console.error('Error updating doctor profile:', error);
                return res.status(HttpStatus_1.HttpStatus.INTERNAL_SERVER_ERROR).json({ message: doctorMessages_1.Messages.Errors.INTERNAL_SERVER_ERROR });
            }
        });
    }
    saveDefaultTokens(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            var _a;
            try {
                const { selectedDay, slots } = req.body;
                const doctorId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.userId; // Assuming req.user has the authenticated doctorI      
                const defaultTokens = yield doctorService_1.doctorService.saveDefaultTokens(selectedDay, slots, doctorId);
                return res.status(HttpStatus_1.HttpStatus.OK).json({
                    message: doctorMessages_1.Messages.Doctor.DEFAULT_TOKENS_SAVED(selectedDay),
                    defaultTokens
                });
            }
            catch (error) {
                console.error('Error saving default tokens:', error);
                return res.status(HttpStatus_1.HttpStatus.INTERNAL_SERVER_ERROR).json({ message: doctorMessages_1.Messages.Errors.INTERNAL_SERVER_ERROR });
            }
        });
    }
    getDoctorSlots(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            var _a;
            try {
                let { doctorId } = req.params;
                if (!doctorId) {
                    doctorId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.userId;
                }
                const slots = yield doctorService_1.doctorService.getDoctorSlots(doctorId);
                res.status(HttpStatus_1.HttpStatus.OK).json(slots);
            }
            catch (error) {
                console.error('Error fetching slots:', error);
                res.status(HttpStatus_1.HttpStatus.INTERNAL_SERVER_ERROR).json({ message: doctorMessages_1.Messages.Errors.INTERNAL_SERVER_ERROR });
            }
        });
    }
    ;
    savePrescription(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            var _a;
            try {
                const { symptoms, diagnosis, medications, patientId } = req.body;
                const doctorId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.userId;
                if (!doctorId) {
                    return res.status(HttpStatus_1.HttpStatus.BAD_REQUEST).json({ message: doctorMessages_1.Messages.Errors.DOCTOR_ID_MISSING });
                }
                const prescription = yield doctorRepository_1.doctorRepository.savePrescription(symptoms, diagnosis, medications, doctorId, patientId);
                return res.status(HttpStatus_1.HttpStatus.CREATED).json({
                    message: doctorMessages_1.Messages.Doctor.PRESCRIPTION_SAVED,
                    prescription,
                });
            }
            catch (error) {
                console.error('Error saving prescription:', error);
                return res.status(HttpStatus_1.HttpStatus.INTERNAL_SERVER_ERROR).json({ message: doctorMessages_1.Messages.Errors.INTERNAL_SERVER_ERROR });
            }
        });
    }
    getPrescriptionsByDoctorId(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            var _a;
            try {
                const doctorId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.userId;
                const prescriptions = yield doctorService_1.doctorService.getPrescriptionsByDoctortId(doctorId);
                res.status(HttpStatus_1.HttpStatus.OK).json(prescriptions);
            }
            catch (error) {
                res.status(HttpStatus_1.HttpStatus.BAD_REQUEST).json({
                    success: false,
                    message: error.message,
                });
            }
        });
    }
    getReviewsByDoctorId(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            var _a;
            try {
                const doctorId = req.query.doctorId || ((_a = req.user) === null || _a === void 0 ? void 0 : _a.userId);
                console.log('doc id ', doctorId);
                const reviews = yield doctorService_1.doctorService.getReviewsByDoctorId(doctorId);
                res.status(HttpStatus_1.HttpStatus.OK).json(reviews);
            }
            catch (error) {
                console.log('error fetching review from doc controller', error);
            }
        });
    }
}
exports.doctorController = new DoctorController();
