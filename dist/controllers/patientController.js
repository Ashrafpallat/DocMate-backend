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
exports.patientController = void 0;
const patientService_1 = require("../services/patientService");
const patientRepository_1 = require("../repositories/patientRepository");
const generateToken_1 = require("../utils/generateToken");
const cloudinery_1 = __importDefault(require("../config/cloudinery"));
const stripe_1 = __importDefault(require("stripe"));
const dotenv_1 = __importDefault(require("dotenv"));
const HttpStatus_1 = require("../utils/HttpStatus"); // Import the HttpStatus enum
const patientMessages_1 = require("../utils/patientMessages");
dotenv_1.default.config();
const stripe = new stripe_1.default(process.env.STRIPE_SECRET_KEY, {
    apiVersion: '2024-09-30.acacia',
});
class PatientController {
    refreshAccessToken(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { refreshToken } = req.cookies;
                if (!refreshToken) {
                    return res.status(HttpStatus_1.HttpStatus.UNAUTHORIZED).json({ message: patientMessages_1.Messages.Errors.NO_REFRESH_TOKEN });
                }
                const decoded = (0, generateToken_1.verifyToken)(refreshToken, true); // Verify the refresh token
                const accessToken = (0, generateToken_1.generateAccessToken)({ userId: decoded.userId, email: decoded.email, name: decoded.name, role: decoded.role }, res);
                return res.status(HttpStatus_1.HttpStatus.OK).json({ message: patientMessages_1.Messages.Success.NEW_ACCESSTOKEN });
            }
            catch (error) {
                return res.status(HttpStatus_1.HttpStatus.UNAUTHORIZED).json({ message: patientMessages_1.Messages.Errors.INVALID_REFRESH_TOKEN });
            }
        });
    }
    googleAuth(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const { name, email } = req.body;
            try {
                const patient = yield patientRepository_1.patientRepository.googleAuth(name, email);
                if (patient.status === 'Blocked') {
                    return res.status(403).json({ message: patientMessages_1.Messages.Errors.ACCOUNT_BLOCKED });
                }
                (0, generateToken_1.generateAccessToken)({ userId: patient._id, email: patient.email, name: patient.name, role: patient.role }, res);
                (0, generateToken_1.generateRefreshToken)({ userId: patient._id, email: patient.email, name: patient.name, role: patient.role }, res);
                return res.status(HttpStatus_1.HttpStatus.OK).json({ message: 'User authenticated', patient });
            }
            catch (error) {
                console.error('Error processing Google authentication:', error);
                return res.status(HttpStatus_1.HttpStatus.INTERNAL_SERVER_ERROR).json({ message: patientMessages_1.Messages.Errors.INTERNAL_SERVER_ERROR });
            }
        });
    }
    signup(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { name, email, password, age, gender, location } = req.body;
                const newPatient = yield patientService_1.patientService.registerPatient({
                    name,
                    email,
                    password,
                    age,
                    gender,
                    location,
                });
                return res.status(HttpStatus_1.HttpStatus.OK).json({ message: patientMessages_1.Messages.Success.USER_REGISTERED, newPatient });
            }
            catch (error) {
                return res.status(HttpStatus_1.HttpStatus.BAD_REQUEST).json({ message: error.message });
            }
        });
    }
    login(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { email, password } = req.body;
                const { patient } = yield patientService_1.patientService.loginPatient(email, password);
                if (patient.status === 'Blocked') {
                    return res.status(403).json({ message: patientMessages_1.Messages.Errors.ACCOUNT_BLOCKED });
                }
                const accessToken = (0, generateToken_1.generateAccessToken)({ userId: patient._id, email: patient.email, name: patient.name, role: patient.role }, res);
                const refreshToken = (0, generateToken_1.generateRefreshToken)({ userId: patient._id, email: patient.email, name: patient.name, role: patient.role }, res);
                return res.status(HttpStatus_1.HttpStatus.OK).json({ message: patientMessages_1.Messages.Success.LOGIN_SUCCESSFUL, patient });
            }
            catch (error) {
                return res.status(HttpStatus_1.HttpStatus.BAD_REQUEST).json({ message: error.message });
            }
        });
    }
    getProfile(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            var _a;
            try {
                const patientId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.userId;
                console.log('patient id frm patient ctrlr, getProfile', patientId);
                const patient = yield patientRepository_1.patientRepository.findPatientById(patientId);
                if (!patient) {
                    console.log(patientMessages_1.Messages.Errors.PATIENT_NOT_FOUND);
                    return res.status(HttpStatus_1.HttpStatus.UNAUTHORIZED).json({ message: patientMessages_1.Messages.Errors.PATIENT_NOT_FOUND });
                }
                return res.status(HttpStatus_1.HttpStatus.OK).json(patient);
            }
            catch (error) {
                console.error('Error fetching patient profile:', error);
                return res.status(HttpStatus_1.HttpStatus.INTERNAL_SERVER_ERROR).json({ message: patientMessages_1.Messages.Errors.INTERNAL_SERVER_ERROR });
            }
        });
    }
    updateProfile(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            var _a;
            try {
                const patientId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.userId;
                const patient = yield patientRepository_1.patientRepository.findPatientById(patientId);
                if (!patient) {
                    return res.status(HttpStatus_1.HttpStatus.NOT_FOUND).json({ message: patientMessages_1.Messages.Errors.PATIENT_NOT_FOUND });
                }
                let profilePhoto = req.file ? req.file.path : patient.profilePhoto;
                console.log('profilephoto', profilePhoto);
                if (req.file) {
                    const uploadResult = yield cloudinery_1.default.v2.uploader.upload(req.file.path);
                    profilePhoto = uploadResult.secure_url; // Update with the new uploaded photo URL
                }
                else if (!patient.profilePhoto) {
                    profilePhoto = 'https://example.com/default-profile.png'; // Placeholder default image
                }
                // const uploadResult = await cloudinary.v2.uploader.upload(profilePhoto);
                const updatedData = {
                    name: req.body.name || patient.name,
                    email: req.body.email || patient.email,
                    age: req.body.age || patient.age,
                    location: req.body.location || patient.location,
                    profilePhoto
                };
                const updatedDoctor = yield patientRepository_1.patientRepository.updatePatientProfile(patientId, updatedData);
                return res.status(HttpStatus_1.HttpStatus.OK).json(updatedDoctor);
            }
            catch (error) {
                console.error('Error updating doctor profile:', error);
                return res.status(HttpStatus_1.HttpStatus.INTERNAL_SERVER_ERROR).json({ message: patientMessages_1.Messages.Errors.INTERNAL_SERVER_ERROR });
            }
        });
    }
    getDoctorsNearby(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { lat, lng, page = 1, limit = 3 } = req.query; // Default to page 1 and limit 3
                if (!lat || !lng) {
                    return res.status(HttpStatus_1.HttpStatus.BAD_REQUEST).json({ message: patientMessages_1.Messages.Errors.INVALID_LAT_LNG });
                }
                const latitude = parseFloat(lat);
                const longitude = parseFloat(lng);
                if (isNaN(latitude) || isNaN(longitude)) {
                    return res.status(HttpStatus_1.HttpStatus.BAD_REQUEST).json({ message: patientMessages_1.Messages.Errors.INVALID_LAT_LNG });
                }
                // Convert page and limit to numbers
                const pageNum = parseInt(page, 10);
                const limitNum = parseInt(limit, 10);
                const { doctors, totalCount } = yield patientRepository_1.patientRepository.findDoctorsNearby(latitude, longitude, pageNum, limitNum);
                return res.status(HttpStatus_1.HttpStatus.OK).json({ doctors, totalCount });
            }
            catch (error) {
                console.error('Error fetching nearby doctors:', error);
                return res.status(HttpStatus_1.HttpStatus.INTERNAL_SERVER_ERROR).json({ message: patientMessages_1.Messages.Errors.INTERNAL_SERVER_ERROR });
            }
        });
    }
    logout(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                // Clear the access token by setting an expired date and consistent properties
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
                console.log('Logout successful');
                return res.status(HttpStatus_1.HttpStatus.OK).json({ message: patientMessages_1.Messages.Success.LOGOUT_SUCCESSFUL });
            }
            catch (error) {
                return res.status(HttpStatus_1.HttpStatus.INTERNAL_SERVER_ERROR).json({ message: patientMessages_1.Messages.Errors.INTERNAL_SERVER_ERROR, error });
            }
        });
    }
    reserveSlot(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            var _a;
            try {
                const { doctorId, day, slotIndex } = req.body;
                const patientId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.userId;
                if (!patientId) {
                    return res.status(HttpStatus_1.HttpStatus.UNAUTHORIZED).json({ message: patientMessages_1.Messages.Errors.AUTHENTICATION_REQUIRED });
                }
                const reservedSlot = yield patientRepository_1.patientRepository.reserveSlot(doctorId, day, slotIndex, patientId);
                return res.status(HttpStatus_1.HttpStatus.OK).json({ message: 'Slot reserved successfully', reservedSlot });
            }
            catch (error) {
                console.error('Error reserving slot:', error);
                return res.status(HttpStatus_1.HttpStatus.INTERNAL_SERVER_ERROR).json({ message: error.message || patientMessages_1.Messages.Errors.INTERNAL_SERVER_ERROR });
            }
        });
    }
    createPaymentSession(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const { doctorId, amount, day, slotIndex } = req.body;
            if (!doctorId) {
                throw new Error('Doctor ID is missing');
            }
            if (!amount) {
                throw new Error('Amount is missing');
            }
            if (!day) {
                throw new Error('Day is missing');
            }
            if (slotIndex === null || slotIndex === undefined) {
                throw new Error('Slot index is missing');
            }
            try {
                const session = yield stripe.checkout.sessions.create({
                    payment_method_types: ['card'],
                    line_items: [
                        {
                            price_data: {
                                currency: 'inr',
                                product_data: {
                                    name: 'Doctor Appointment Booking',
                                },
                                unit_amount: amount, // Amount in paise (1 INR = 100 paise)
                            },
                            quantity: 1,
                        },
                    ],
                    mode: 'payment',
                    success_url: `${process.env.FRONTEND_URL}/patient/payment-success?doctorId=${doctorId}&day=${day}&slotIndex=${slotIndex}`,
                    cancel_url: `${process.env.FRONTEND_URL}/patient/payment-failed`,
                });
                res.json({ sessionId: session.id });
            }
            catch (error) {
                console.error(error);
                res.status(HttpStatus_1.HttpStatus.INTERNAL_SERVER_ERROR).json({ error: 'Could not create payment session' });
            }
        });
    }
    pendingAppointments(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            var _a;
            try {
                const patientId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.userId;
                if (!patientId) {
                    return res.status(HttpStatus_1.HttpStatus.UNAUTHORIZED).json({ message: patientMessages_1.Messages.Errors.AUTHENTICATION_REQUIRED });
                }
                // Fetch the patient's pending appointments from the service
                const appointments = yield patientService_1.patientService.findPendingAppointments(patientId);
                // if (!appointments || appointments.length === 0) {
                //   return res.status(HttpStatus.NOT_FOUND).json({ message: 'No appointments found' });
                // }
                return res.status(HttpStatus_1.HttpStatus.OK).json({ message: patientMessages_1.Messages.Success.APPOINTMENTS_FETCHED, appointments });
            }
            catch (error) {
                console.error('Error fetching appointments:', error.message);
                return res.status(HttpStatus_1.HttpStatus.INTERNAL_SERVER_ERROR).json({ message: error.message || patientMessages_1.Messages.Errors.INTERNAL_SERVER_ERROR });
            }
        });
    }
    getPrescriptionsByPatientId(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            var _a;
            try {
                const patientId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.userId;
                const prescriptions = yield patientService_1.patientService.getPrescriptionsByPatientId(patientId);
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
    addReviewAndRating(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            var _a;
            const patientId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.userId;
            const { doctorId, rating, reviewText } = req.body;
            yield patientService_1.patientService.addReviewAndRating(patientId, doctorId, rating, reviewText);
            return res.status(HttpStatus_1.HttpStatus.OK).json({ message: patientMessages_1.Messages.Success.REVIEW_ADDED });
        });
    }
}
exports.patientController = new PatientController();
