import { Router } from 'express';
import { adminController } from '../controllers/adminController';

const adminRouter = Router();

// POST: http://localhost:5000/api/admin/login
adminRouter.post('/login', adminController.login);

adminRouter.get('/pending-verifications', adminController.getPendingVerifications)
adminRouter.post('/pending-verifications/:id', adminController.approveVerification); 

adminRouter.get('/patients', adminController.getAllPatients)
adminRouter.put('/patient/:patientId/status', adminController.updatePatientStatus); 

adminRouter.get('/doctors', adminController.getAllDoctors)
adminRouter.put('/doctors/:doctorId/status', adminController.updateDoctorStatus);

adminRouter.get('/getAllPrescriptions',adminController.getAllPresciptions)
adminRouter.get('/getPatientsByMonth',adminController.getPatientsByMonth) 
adminRouter.get('/getDoctorsByMonth',adminController.getDoctorsByMonth) 
adminRouter.get('/getPatientsByYear',adminController.getPatientsByYear) 
adminRouter.get('/getDoctorsByYear',adminController.getDoctorsByYear) 

adminRouter.post('/logout', adminController.logout);

export default adminRouter;
