import { Router } from 'express';
import { adminController } from '../controllers/adminController';

const adminRouter = Router();

// POST: http://localhost:5000/api/admin/login
adminRouter.post('/login', adminController.login);

// POST: http://localhost:5000/api/admin/logout
adminRouter.post('/logout', adminController.logout);

export default adminRouter;
