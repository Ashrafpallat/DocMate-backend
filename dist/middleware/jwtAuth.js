"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const generateToken_1 = require("../utils/generateToken"); // Assuming you have these utility functions
const authMiddleware = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    let token = req.cookies.accessToken;
    if (!token) {
        console.log('Access token not found, checking for refresh token...');
        const refreshToken = req.cookies.refreshToken;
        if (!refreshToken) {
            return res.status(401).json({ message: 'No access or refresh token provided' });
        }
        try {
            // Verify the refresh token
            const decodedRefreshToken = (0, generateToken_1.verifyToken)(refreshToken, true); // true indicates it's a refresh token
            // Generate a new access token
            token = (0, generateToken_1.generateAccessToken)({
                userId: decodedRefreshToken.userId,
                email: decodedRefreshToken.email,
                name: decodedRefreshToken.name,
            }, res);
            // Optionally, set the new access token in the response cookies
            res.cookie('accessToken', token, { httpOnly: true, secure: process.env.NODE_ENV === 'production' });
            console.log('New access token generated and sent to client.');
        }
        catch (error) {
            console.log('Error with refresh token:', error);
            return res.status(401).json({ message: 'Invalid or expired refresh token' });
        }
    }
    try {
        // Verify the access token (new or existing)
        const decoded = (0, generateToken_1.verifyToken)(token);
        // Attach the decoded token payload to the request
        req.user = decoded;
        // Continue to the next middleware or route
        next();
    }
    catch (error) {
        console.log('Error with access token:', error);
        return res.status(401).json({ message: 'Invalid or expired access token' });
    }
});
exports.default = authMiddleware;
