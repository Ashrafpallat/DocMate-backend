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
exports.adminController = void 0;
const adminService_1 = require("../services/adminService");
const verificationRequestRepository_1 = __importDefault(require("../repositories/verificationRequestRepository"));
const HttpStatus_1 = require("../utils/HttpStatus"); // Import the HttpStatus enum
const generateToken_1 = require("../utils/generateToken");
const adminMessages_1 = require("../utils/adminMessages");
class AdminController {
    login(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { email, password } = req.body;
                const { admin } = yield adminService_1.adminService.loginAdmin(email, password);
                const accessToken = (0, generateToken_1.generateAccessToken)({ userId: admin.userId, email: admin.email, name: admin.name }, res);
                const refreshToken = (0, generateToken_1.generateRefreshToken)({ userId: admin.userId, email: admin.email, name: admin.name }, res);
                return res.status(HttpStatus_1.HttpStatus.OK).json({ message: adminMessages_1.Messages.Admin.LOGIN_SUCCESS, admin });
            }
            catch (error) {
                return res.status(HttpStatus_1.HttpStatus.BAD_REQUEST).json({ message: error.message });
            }
        });
    }
    getPendingVerifications(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const pendingRequests = yield verificationRequestRepository_1.default.getPendingRequests();
                return res.status(HttpStatus_1.HttpStatus.OK).json(pendingRequests);
            }
            catch (error) {
                console.error('Error fetching pending verifications:', error);
                return res.status(HttpStatus_1.HttpStatus.INTERNAL_SERVER_ERROR).json({ message: adminMessages_1.Messages.Errors.INTERNAL_SERVER_ERROR });
            }
        });
    }
    approveVerification(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const id = req.params.id;
            try {
                const approvedRequest = yield verificationRequestRepository_1.default.approveRequest(id);
                if (!approvedRequest) {
                    return res.status(HttpStatus_1.HttpStatus.NOT_FOUND).json({ message: adminMessages_1.Messages.Errors.VERIFICATION_NOT_FOUND });
                }
                return res.status(HttpStatus_1.HttpStatus.OK).json({ message: adminMessages_1.Messages.Admin.DOCTOR_APPROVED_SUCCESS, approvedRequest });
            }
            catch (error) {
                console.error('Error approving verification:', error);
                return res.status(HttpStatus_1.HttpStatus.INTERNAL_SERVER_ERROR).json({ message: adminMessages_1.Messages.Errors.INTERNAL_SERVER_ERROR });
            }
        });
    }
    getAllPatients(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const patients = yield adminService_1.adminService.getAllPatients();
                return res.status(HttpStatus_1.HttpStatus.OK).json(patients);
            }
            catch (error) {
                console.error('Error fetching patients:', error);
                return res.status(HttpStatus_1.HttpStatus.INTERNAL_SERVER_ERROR).json({ message: adminMessages_1.Messages.Errors.INTERNAL_SERVER_ERROR });
            }
        });
    }
    updatePatientStatus(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const { patientId } = req.params;
            const { status } = req.body;
            try {
                const updatedPatient = yield adminService_1.adminService.updatePatientStatus(patientId, status);
                if (!updatedPatient) {
                    return res.status(HttpStatus_1.HttpStatus.NOT_FOUND).json({ message: adminMessages_1.Messages.Errors.PATIENT_NOT_FOUND });
                }
                return res.status(HttpStatus_1.HttpStatus.OK).json({ message: adminMessages_1.Messages.Admin.PATIENT_STATUS_UPDATED, updatedPatient });
            }
            catch (error) {
                console.error('Error updating patient status:', error);
                return res.status(HttpStatus_1.HttpStatus.INTERNAL_SERVER_ERROR).json({ message: adminMessages_1.Messages.Errors.INTERNAL_SERVER_ERROR });
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
                return res.status(HttpStatus_1.HttpStatus.OK).json({ message: adminMessages_1.Messages.Admin.LOGOUT_SUCCESS });
            }
            catch (error) {
                return res.status(HttpStatus_1.HttpStatus.INTERNAL_SERVER_ERROR).json({ message: adminMessages_1.Messages.Errors.INTERNAL_SERVER_ERROR, error });
            }
        });
    }
    getAllDoctors(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const doctors = yield adminService_1.adminService.fetchAllDoctors();
                res.status(200).json(doctors);
            }
            catch (error) {
                res.status(500).json({ message: adminMessages_1.Messages.Errors.FAILED_TO_FETCH_DOCTORS, error });
            }
        });
    }
    // Block/Unblock a doctor
    updateDoctorStatus(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { doctorId } = req.params;
                const { status } = req.body;
                const updatedDoctor = yield adminService_1.adminService.updateDoctorStatus(doctorId, status);
                if (!updatedDoctor) {
                    return res.status(404).json({ message: adminMessages_1.Messages.Errors.DOCTOR_NOT_FOUND });
                }
                res.status(200).json({ message: `Doctor ${updatedDoctor.status === 'Active' ? 'unblocked' : 'Blocked'} successfully`, doctor: updatedDoctor });
            }
            catch (error) {
                res.status(500).json({ message: adminMessages_1.Messages.Errors.FAILED_TO_UPDATE_DOCTOR_STATUS, error });
            }
        });
    }
    getAllPresciptions(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const presciptions = yield adminService_1.adminService.getAllPrescriptions();
                res.status(200).json(presciptions);
            }
            catch (error) {
                return res.status(HttpStatus_1.HttpStatus.INTERNAL_SERVER_ERROR).json({ message: adminMessages_1.Messages.Errors.INTERNAL_SERVER_ERROR });
            }
        });
    }
    getPatientsByMonth(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const year = 2024;
                const patientsBymonth = yield adminService_1.adminService.getPatientByMonth(year);
                res.status(200).json(patientsBymonth);
            }
            catch (error) {
                return res.status(HttpStatus_1.HttpStatus.INTERNAL_SERVER_ERROR).json({ message: adminMessages_1.Messages.Errors.INTERNAL_SERVER_ERROR });
            }
        });
    }
    getDoctorsByMonth(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const year = 2024;
                const doctorsBymonth = yield adminService_1.adminService.getDoctorstByMonth(year);
                res.status(200).json(doctorsBymonth);
            }
            catch (error) {
                return res.status(HttpStatus_1.HttpStatus.INTERNAL_SERVER_ERROR).json({ message: adminMessages_1.Messages.Errors.INTERNAL_SERVER_ERROR });
            }
        });
    }
    getPatientsByYear(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const years = [2024, 2025, 2026];
                const patientsByYear = yield adminService_1.adminService.getPatientByYear(years);
                res.status(200).json(patientsByYear);
            }
            catch (error) {
                return res.status(HttpStatus_1.HttpStatus.INTERNAL_SERVER_ERROR).json({ message: adminMessages_1.Messages.Errors.INTERNAL_SERVER_ERROR });
            }
        });
    }
    getDoctorsByYear(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const years = [2024, 2025, 2026];
                const doctorsByYear = yield adminService_1.adminService.getDoctorByYear(years);
                res.status(200).json(doctorsByYear);
            }
            catch (error) {
                return res.status(HttpStatus_1.HttpStatus.INTERNAL_SERVER_ERROR).json({ message: adminMessages_1.Messages.Errors.INTERNAL_SERVER_ERROR });
            }
        });
    }
}
exports.adminController = new AdminController();
