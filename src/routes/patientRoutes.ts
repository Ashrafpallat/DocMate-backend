// routes/patientRoutes.ts
import { Router } from 'express';
import { patientController } from '../controllers/patientController';
import authMiddleware from '../middleware/jwtAuth';
import { upload } from '../middleware/upload';
import { checkUserStatus } from '../middleware/userStatus';

const router = Router();

// POST /api/patient/signup - Patient Registration
router.post('/signup', patientController.signup.bind(patientController));

// POST /api/patient/login - Patient Login
router.post('/login', patientController.login.bind(patientController));

// POST /api/patient/logout - Patient Logout
router.post('/logout', patientController.logout.bind(patientController));

// POST /api/patient/google-auth - Google Authentication
router.post('/google-auth', patientController.googleAuth.bind(patientController));

// GET /api/patient/profile - Get patient profile
router.get('/profile', authMiddleware,checkUserStatus, patientController.getProfile.bind(patientController));

// POST /api/patient/profile - Update patient profile
router.post('/profile', authMiddleware, checkUserStatus, upload.single('profilePhoto'), patientController.updateProfile.bind(patientController));

// GET /api/patient/nearby-doctors - Get nearby doctors
router.get('/nearby-doctors', authMiddleware, checkUserStatus, patientController.getDoctorsNearby.bind(patientController));

router.post('/book-slot', authMiddleware,checkUserStatus, patientController.reserveSlot.bind(patientController))

router.post('/payment/create-session',authMiddleware,checkUserStatus, patientController.createPaymentSession.bind(patientController))
 
router.get('/pending-appointments', authMiddleware,checkUserStatus, patientController.pendingAppointments.bind(patientController))

router.get('/history', authMiddleware,checkUserStatus, patientController.getPrescriptionsByPatientId.bind(patientController))

router.post('/add-review', authMiddleware,checkUserStatus, patientController.addReviewAndRating.bind(patientController))

export default router;