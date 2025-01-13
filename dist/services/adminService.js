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
Object.defineProperty(exports, "__esModule", { value: true });
exports.adminService = void 0;
const adminRepository_1 = require("../repositories/adminRepository");
class AdminService {
    loginAdmin(email, password) {
        return __awaiter(this, void 0, void 0, function* () {
            const adminEmail = process.env.ADMIN_EMAIL;
            const adminPassword = process.env.ADMIN_PASSWORD;
            if (email !== adminEmail) {
                throw new Error('Invalid email or password');
            }
            if (password !== adminPassword) {
                throw new Error('Invalid email or password');
            }
            return {
                admin: {
                    userId: '123',
                    email: adminEmail,
                    name: 'DocMate Admin'
                },
            };
        });
    }
    getAllPatients() {
        return __awaiter(this, void 0, void 0, function* () {
            return adminRepository_1.adminRepository.getAllPatients();
        });
    }
    updatePatientStatus(patientId, status) {
        return __awaiter(this, void 0, void 0, function* () {
            return adminRepository_1.adminRepository.updatePatientStatus(patientId, status);
        });
    }
    fetchAllDoctors() {
        return __awaiter(this, void 0, void 0, function* () {
            return adminRepository_1.adminRepository.getAllDoctors();
        });
    }
    // Toggle the status of a doctor
    updateDoctorStatus(doctorId, status) {
        return __awaiter(this, void 0, void 0, function* () {
            // const newStatus = currentStatus === 'active' ? 'blocked' : 'active';
            return adminRepository_1.adminRepository.updateDoctorStatus(doctorId, status);
        });
    }
    getAllPrescriptions() {
        return __awaiter(this, void 0, void 0, function* () {
            return adminRepository_1.adminRepository.getAllPrescriptions();
        });
    }
    getPatientByMonth(year) {
        return __awaiter(this, void 0, void 0, function* () {
            return adminRepository_1.adminRepository.getPatientsByMonth(year);
        });
    }
    getDoctorstByMonth(year) {
        return __awaiter(this, void 0, void 0, function* () {
            return adminRepository_1.adminRepository.getDoctorsByMonth(year);
        });
    }
    getPatientByYear(year) {
        return __awaiter(this, void 0, void 0, function* () {
            return adminRepository_1.adminRepository.getPatientsByYear(year);
        });
    }
    getDoctorByYear(year) {
        return __awaiter(this, void 0, void 0, function* () {
            return adminRepository_1.adminRepository.getDoctorsByYear(year);
        });
    }
}
exports.adminService = new AdminService();
