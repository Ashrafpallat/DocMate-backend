import { Router } from 'express';
import { doctorController } from '../controllers/doctorController';

const router = Router();

// POST /api/doctor/signup - Doctor Registration
router.post('/signup', doctorController.signup.bind(doctorController));
// POST /api/doctor/login - Doctor Login
router.post('/login', doctorController.login.bind(doctorController));
// POST /api/doctor/logout - Doctor Logout
router.post('/logout', doctorController.logout.bind(doctorController));
// POST /api/patient/google-auth - Google Authentication
router.post('/google-auth', doctorController.googleAuth.bind(doctorController));

export default router;
