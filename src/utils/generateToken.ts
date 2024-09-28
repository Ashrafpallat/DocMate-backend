import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'fallback-secret';
const REFRESH_TOKEN_SECRET = process.env.REFRESH_TOKEN_SECRET || 'fallback-refresh-secret';

// Generate Access Token
export const generateAccessToken = (payload: object): string => {
    return jwt.sign(payload, JWT_SECRET, { expiresIn: '15m' }); // Short-lived access token
};

// Generate Refresh Token
export const generateRefreshToken = (payload: object): string => {
    return jwt.sign(payload, REFRESH_TOKEN_SECRET, { expiresIn: '7d' }); // Long-lived refresh token
};

// Verify Token
export const verifyToken = (token: string, isRefreshToken: boolean = false): any => {
    try {
        const secret = isRefreshToken ? REFRESH_TOKEN_SECRET : JWT_SECRET;
        return jwt.verify(token, secret);
    } catch (error) {
        throw new Error('Invalid token');
    }
};
