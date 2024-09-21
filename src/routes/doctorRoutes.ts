import { Router } from 'express';
import { doctorController } from '../controllers/doctorController';

const router = Router();

// POST /api/doctor/signup - Doctor Registration
router.post('/signup', doctorController.signup.bind(doctorController));
// POST /api/doctor/login - Doctor Login
router.post('/login', doctorController.login.bind(doctorController));

export default router;
