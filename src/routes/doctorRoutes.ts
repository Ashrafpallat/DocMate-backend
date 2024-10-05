import { Router } from 'express';
import { doctorController } from '../controllers/doctorController';
import { upload } from '../middleware/upload';
import authMiddleware from '../middleware/jwtAuth'

const router = Router();

// POST /api/doctor/signup - Doctor Registration
router.post('/signup', doctorController.signup.bind(doctorController));
// POST /api/doctor/login - Doctor Login
router.post('/login', doctorController.login.bind(doctorController));
// POST /api/doctor/logout - Doctor Logout
router.post('/logout', doctorController.logout.bind(doctorController));
// POST /api/patient/google-auth - Google Authentication
router.post('/google-auth', doctorController.googleAuth.bind(doctorController));

router.post('/verify',authMiddleware, upload.single('proofFile'), doctorController.verifyDoctor.bind(doctorController));
 
router.get('/profile',authMiddleware, doctorController.getProfile.bind(doctorController))
router.post('/profile',authMiddleware,upload.single('profilePhoto'), doctorController.updateProfile.bind(doctorController))
 
 
export default router;
