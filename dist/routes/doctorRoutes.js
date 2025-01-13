"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const doctorController_1 = require("../controllers/doctorController");
const upload_1 = require("../middleware/upload");
const jwtAuth_1 = __importDefault(require("../middleware/jwtAuth"));
const userStatus_1 = require("../middleware/userStatus");
const resetSlotStatus_1 = __importDefault(require("../middleware/resetSlotStatus"));
const router = (0, express_1.Router)();
// POST /api/doctor/signup - Doctor Registration
router.post('/signup', doctorController_1.doctorController.signup.bind(doctorController_1.doctorController));
// POST /api/doctor/login - Doctor Login
router.post('/login', doctorController_1.doctorController.login.bind(doctorController_1.doctorController));
// POST /api/doctor/logout - Doctor Logout
router.post('/logout', doctorController_1.doctorController.logout.bind(doctorController_1.doctorController));
// POST /api/patient/google-auth - Google Authentication
router.post('/google-auth', doctorController_1.doctorController.googleAuth.bind(doctorController_1.doctorController));
router.post('/verify', jwtAuth_1.default, userStatus_1.checkUserStatus, upload_1.upload.single('proofFile'), doctorController_1.doctorController.verifyDoctor.bind(doctorController_1.doctorController));
router.get('/profile', jwtAuth_1.default, userStatus_1.checkUserStatus, doctorController_1.doctorController.getProfile.bind(doctorController_1.doctorController));
router.post('/profile', jwtAuth_1.default, userStatus_1.checkUserStatus, upload_1.upload.single('profilePhoto'), doctorController_1.doctorController.updateProfile.bind(doctorController_1.doctorController));
router.post('/save-slots', jwtAuth_1.default, userStatus_1.checkUserStatus, doctorController_1.doctorController.saveDefaultTokens.bind(doctorController_1.doctorController));
router.get('/:doctorId/slots', jwtAuth_1.default, userStatus_1.checkUserStatus, resetSlotStatus_1.default, doctorController_1.doctorController.getDoctorSlots.bind(doctorController_1.doctorController));
router.get('/doctor/slotes', jwtAuth_1.default, userStatus_1.checkUserStatus, doctorController_1.doctorController.getDoctorSlots.bind(doctorController_1.doctorController));
router.post('/prescription', jwtAuth_1.default, userStatus_1.checkUserStatus, doctorController_1.doctorController.savePrescription.bind(doctorController_1.doctorController));
router.get('/history', jwtAuth_1.default, userStatus_1.checkUserStatus, doctorController_1.doctorController.getPrescriptionsByDoctorId.bind(doctorController_1.doctorController));
router.get('/reviews', jwtAuth_1.default, userStatus_1.checkUserStatus, doctorController_1.doctorController.getReviewsByDoctorId.bind(doctorController_1.doctorController));
exports.default = router;
