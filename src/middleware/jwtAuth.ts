import { Request, Response, NextFunction } from 'express';
import { verifyToken } from '../utils/generateToken';

const authMiddleware = (req: Request, res: Response, next: NextFunction) => {
    const token = req.cookies.accessToken;
    if (!token) {
        return res.status(401).json({ message: 'No access token provided' });
    }

    try {
        const decoded = verifyToken(token); // Verifies access token
        req.user = decoded; // Attach the decoded token payload to request
        next();
    } catch (error) {
        return res.status(401).json({ message: 'Invalid or expired access token' });
    }
};

export default authMiddleware;
