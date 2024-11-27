import { Request, Response, NextFunction } from 'express';
import { Patient } from '../models/patientModel';
import { Doctor } from '../models/doctorModel';

interface CustomRequest extends Request{
    user?: String | any
}
export const checkUserStatus = async (req: CustomRequest, res: Response, next: NextFunction) => {
  try {
    const userId = req.user?.userId;// Assuming `req.user` is populated from your authentication middleware.
    let user = await Patient.findById(userId);
    if(!user){
      user = await Doctor.findById(userId)
    }

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    if (user.status === 'Blocked') {
      return res.status(403).json({ message: 'Your account has been blocked' });
    }

    next(); // Proceed to the next middleware or route handler if status is Active.
  } catch (error) {
    console.error('Error checking user status:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};
