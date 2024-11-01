import { verifyToken, generateAccessToken } from '../utils/generateToken'; // Assuming you have these utility functions
import { Request, Response, NextFunction } from 'express';


interface CustomRequest extends Request{
    user?: String | any
}

const authMiddleware = async (req: CustomRequest, res: Response, next: NextFunction) => {
    let token = req.cookies.accessToken;

    if (!token) {
        console.log('Access token not found, checking for refresh token...');
        
        const refreshToken = req.cookies.refreshToken;
        if (!refreshToken) {
            return res.status(401).json({ message: 'No access or refresh token provided' });
        }

        try {
            // Verify the refresh token
            const decodedRefreshToken = verifyToken(refreshToken, true); // true indicates it's a refresh token
            // Generate a new access token
            token = generateAccessToken({
                userId: decodedRefreshToken.userId, 
                email: decodedRefreshToken.email,
                name: decodedRefreshToken.name,
            },res);

            // Optionally, set the new access token in the response cookies
            res.cookie('accessToken', token, { httpOnly: true, secure: process.env.NODE_ENV === 'production' });

            console.log('New access token generated and sent to client.');
        } catch (error) {
            console.log('Error with refresh token:', error);
            return res.status(401).json({ message: 'Invalid or expired refresh token' });
        }
    }

    try {
        // Verify the access token (new or existing)
        const decoded: any = verifyToken(token);
        // Attach the decoded token payload to the request
        req.user = decoded

        
        // Continue to the next middleware or route
        next();
    } catch (error) {
        console.log('Error with access token:', error);
        return res.status(401).json({ message: 'Invalid or expired access token' });
    }
};

export default authMiddleware;
