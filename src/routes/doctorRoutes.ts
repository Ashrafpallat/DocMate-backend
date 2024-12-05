import { Router } from 'express';
import { doctorController } from '../controllers/doctorController';
import { upload } from '../middleware/upload';
import authMiddleware from '../middleware/jwtAuth'
import { checkUserStatus } from '../middleware/userStatus';

const router = Router();

// POST /api/doctor/signup - Doctor Registration
router.post('/signup', doctorController.signup.bind(doctorController));
// POST /api/doctor/login - Doctor Login
router.post('/login', doctorController.login.bind(doctorController));
// POST /api/doctor/logout - Doctor Logout
router.post('/logout', doctorController.logout.bind(doctorController));
// POST /api/patient/google-auth - Google Authentication
router.post('/google-auth', doctorController.googleAuth.bind(doctorController));

router.post('/verify',authMiddleware,checkUserStatus, upload.single('proofFile'), doctorController.verifyDoctor.bind(doctorController));

router.get('/profile',authMiddleware, checkUserStatus, doctorController.getProfile.bind(doctorController))
router.post('/profile',authMiddleware,checkUserStatus,upload.single('profilePhoto'), doctorController.updateProfile.bind(doctorController))
router.post('/save-slots', authMiddleware,checkUserStatus, doctorController.saveDefaultTokens.bind(doctorController))
router.get('/:doctorId/slots', authMiddleware,checkUserStatus, doctorController.getDoctorSlots.bind(doctorController))
router.get('/doctor/slotes', authMiddleware,checkUserStatus, doctorController.getDoctorSlots.bind(doctorController))

router.post('/prescription', authMiddleware,checkUserStatus, doctorController.savePrescription.bind(doctorController))


export default router;
