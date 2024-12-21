import jwt from 'jsonwebtoken';
import { Response } from 'express';

const JWT_SECRET = process.env.JWT_SECRET || 'fallback-secret';
const REFRESH_TOKEN_SECRET = process.env.REFRESH_TOKEN_SECRET || 'fallback-refresh-secret';

export const generateAccessToken = (payload: object, res: Response): string => {
    console.log('access token payload',payload);
    
    const accessToken = jwt.sign(payload, JWT_SECRET, { expiresIn: '15m' }); // Short-lived access token
    // Set the access token as an HTTP-only cookie
    res.cookie('accessToken', accessToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV !== 'development',
        maxAge: 1 * 24 * 60 * 60 * 1000, // 1 days
        sameSite: 'none',
        path: '/',
    });
    return accessToken;
};

// Generate Refresh Token and Set Cookie
export const generateRefreshToken = (payload: object, res: Response): string => {
    const refreshToken = jwt.sign(payload, REFRESH_TOKEN_SECRET, { expiresIn: '7d' }); // Long-lived refresh token
    console.log('resfresh token payload',payload);
    // Set the refresh token as an HTTP-only cookie
    res.cookie('refreshToken', refreshToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV !== 'development',
        maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
        sameSite: 'none',
        path: '/',
    });
    return refreshToken;
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
