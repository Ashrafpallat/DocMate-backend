// routes/patientRoutes.ts
import { Router } from 'express';
import { patientController } from '../controllers/patientController';

const router = Router();

// POST /api/patient/signup - Patient Registration
router.post('/signup', patientController.signup.bind(patientController));

// POST /api/patient/login - Patient Login
router.post('/login', patientController.login.bind(patientController));

// POST /api/patient/logout - Patient Logout
router.post('/logout', patientController.logout.bind(patientController));

// POST /api/patient/google-auth - Google Authentication
router.post('/google-auth', patientController.googleAuth.bind(patientController));

export default router;
