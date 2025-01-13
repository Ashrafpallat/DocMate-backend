"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importDefault(require("mongoose"));
const verificationRequestSchema = new mongoose_1.default.Schema({
    name: { type: String, required: true },
    regNo: { type: String, required: true },
    yearOfReg: { type: String, required: true },
    medicalCouncil: { type: String, required: true },
    proofFile: { type: String, required: true },
    doctorId: { type: mongoose_1.default.Schema.Types.ObjectId, ref: 'Doctor', required: true },
});
const VerificationRequest = mongoose_1.default.model('VerificationRequest', verificationRequestSchema);
exports.default = VerificationRequest;
