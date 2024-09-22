import { Request, Response } from 'express';
import { adminService } from '../services/adminService';

class AdminController {
  async login(req: Request, res: Response): Promise<Response> {
    try {
      const { email, password } = req.body;

      const { admin, token } = await adminService.loginAdmin(email, password);

      res.cookie('token', token, {
        httpOnly: true, // Cookie is only accessible by the server
        secure: process.env.NODE_ENV === 'production', // Secure cookie in production (HTTPS)
        maxAge: 30 * 24 * 60 * 60 * 1000, // 30 days
      });

      return res.status(200).json({ message: 'Admin login successful', admin });
    } catch (error: any) {
      return res.status(400).json({ message: error.message });
    }
  }

  async logout(req: Request, res: Response): Promise<Response> {
    try {
      res.cookie('token', '', {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        expires: new Date(0), // Expire immediately
      });

      return res.status(200).json({ message: 'Logout successful' });
    } catch (error) {
      return res.status(500).json({ message: 'Server error', error });
    }
  }
}

export const adminController = new AdminController();
