import { Router } from 'express';
import { adminController } from '../controllers/adminController';

const adminRouter = Router();

// POST: http://localhost:5000/api/admin/login
adminRouter.post('/login', adminController.login);

adminRouter.get('/pending-verifications', adminController.getPendingVerifications)
adminRouter.post('/pending-verifications/:id', adminController.approveVerification); 

adminRouter.get('/patients', adminController.getAllPatients)
adminRouter.put('/patient/:patientId/status', adminController.updatePatientStatus); 


// POST: http://localhost:5000/api/admin/logout
adminRouter.post('/logout', adminController.logout);

export default adminRouter;
