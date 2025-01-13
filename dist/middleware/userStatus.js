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
exports.checkUserStatus = void 0;
const patientModel_1 = require("../models/patientModel");
const doctorModel_1 = require("../models/doctorModel");
const checkUserStatus = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    try {
        const userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.userId; // Assuming `req.user` is populated from your authentication middleware.
        let user = yield patientModel_1.Patient.findById(userId);
        if (!user) {
            user = yield doctorModel_1.Doctor.findById(userId);
        }
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }
        if (user.status === 'Blocked') {
            return res.status(403).json({ message: 'Your account has been blocked' });
        }
        next(); // Proceed to the next middleware or route handler if status is Active.
    }
    catch (error) {
        console.error('Error checking user status:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
});
exports.checkUserStatus = checkUserStatus;
