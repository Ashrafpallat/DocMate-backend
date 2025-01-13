"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
// routes/patientRoutes.ts
const express_1 = require("express");
const patientController_1 = require("../controllers/patientController");
const jwtAuth_1 = __importDefault(require("../middleware/jwtAuth"));
const upload_1 = require("../middleware/upload");
const userStatus_1 = require("../middleware/userStatus");
const router = (0, express_1.Router)();
// POST /api/patient/signup - Patient Registration
router.post('/signup', patientController_1.patientController.signup.bind(patientController_1.patientController));
// POST /api/patient/login - Patient Login
router.post('/login', patientController_1.patientController.login.bind(patientController_1.patientController));
// POST /api/patient/logout - Patient Logout
router.post('/logout', patientController_1.patientController.logout.bind(patientController_1.patientController));
// POST /api/patient/google-auth - Google Authentication
router.post('/google-auth', patientController_1.patientController.googleAuth.bind(patientController_1.patientController));
// GET /api/patient/profile - Get patient profile
router.get('/profile', jwtAuth_1.default, userStatus_1.checkUserStatus, patientController_1.patientController.getProfile.bind(patientController_1.patientController));
// POST /api/patient/profile - Update patient profile
router.post('/profile', jwtAuth_1.default, userStatus_1.checkUserStatus, upload_1.upload.single('profilePhoto'), patientController_1.patientController.updateProfile.bind(patientController_1.patientController));
// GET /api/patient/nearby-doctors - Get nearby doctors
router.get('/nearby-doctors', jwtAuth_1.default, userStatus_1.checkUserStatus, patientController_1.patientController.getDoctorsNearby.bind(patientController_1.patientController));
router.post('/book-slot', jwtAuth_1.default, userStatus_1.checkUserStatus, patientController_1.patientController.reserveSlot.bind(patientController_1.patientController));
router.post('/payment/create-session', jwtAuth_1.default, userStatus_1.checkUserStatus, patientController_1.patientController.createPaymentSession.bind(patientController_1.patientController));
router.get('/pending-appointments', jwtAuth_1.default, userStatus_1.checkUserStatus, patientController_1.patientController.pendingAppointments.bind(patientController_1.patientController));
router.get('/history', jwtAuth_1.default, userStatus_1.checkUserStatus, patientController_1.patientController.getPrescriptionsByPatientId.bind(patientController_1.patientController));
router.post('/add-review', jwtAuth_1.default, userStatus_1.checkUserStatus, patientController_1.patientController.addReviewAndRating.bind(patientController_1.patientController));
exports.default = router;
