"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.verifyToken = exports.generateRefreshToken = exports.generateAccessToken = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const JWT_SECRET = process.env.JWT_SECRET || 'fallback-secret';
const REFRESH_TOKEN_SECRET = process.env.REFRESH_TOKEN_SECRET || 'fallback-refresh-secret';
const generateAccessToken = (payload, res) => {
    console.log('access token payload', payload);
    const accessToken = jsonwebtoken_1.default.sign(payload, JWT_SECRET, { expiresIn: '15m' }); // Short-lived access token
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
exports.generateAccessToken = generateAccessToken;
// Generate Refresh Token and Set Cookie
const generateRefreshToken = (payload, res) => {
    const refreshToken = jsonwebtoken_1.default.sign(payload, REFRESH_TOKEN_SECRET, { expiresIn: '7d' }); // Long-lived refresh token
    console.log('resfresh token payload', payload);
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
exports.generateRefreshToken = generateRefreshToken;
// Verify Token 
const verifyToken = (token, isRefreshToken = false) => {
    try {
        const secret = isRefreshToken ? REFRESH_TOKEN_SECRET : JWT_SECRET;
        return jsonwebtoken_1.default.verify(token, secret);
    }
    catch (error) {
        throw new Error('Invalid token');
    }
};
exports.verifyToken = verifyToken;
