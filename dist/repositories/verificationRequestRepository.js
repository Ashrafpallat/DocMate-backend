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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const doctorModel_1 = require("../models/doctorModel");
const verificationModel_1 = __importDefault(require("../models/verificationModel")); // Assuming this is your Mongoose model
class VerificationRequestRepository {
    // Fetch pending verification requests (not yet approved)
    // Fetch pending verification requests (not yet approved)
    getPendingRequests() {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                // Find all requests where 'approved' is false
                const pendingRequests = yield verificationModel_1.default.find();
                // Cast the result to IVerificationRequest[] to avoid type error
                return pendingRequests.map((request) => request.toObject());
            }
            catch (error) {
                console.error('Error fetching pending verification requests:', error);
                throw new Error('Could not fetch pending verification requests');
            }
        });
    }
    // Approve a verification request by its ID
    // Approve a verification request by its ID
    approveRequest(id) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                // Find the verification request to get the doctor's name
                const approvedRequest = yield verificationModel_1.default.findOne({ doctorId: id });
                // Check if the approvedRequest was found
                if (!approvedRequest) {
                    throw new Error('Verification request not found');
                }
                // Get the doctor's name from the approved request
                const doctorId = approvedRequest.doctorId;
                // Update the doctor's KYC verification status
                yield doctorModel_1.Doctor.findByIdAndUpdate({ _id: doctorId }, // Update the doctor based on the name
                { kycVerified: true }, // Set kycVerified to true
                { new: true } // Return the updated doctor document
                );
                // Delete the verification request after processing
                yield verificationModel_1.default.findOneAndDelete({ doctorId: id });
                // Return the approved request or null if needed
                return approvedRequest; // Explicit casting
            }
            catch (error) {
                console.error('Error approving the verification request:', error);
                throw new Error('Could not approve the verification request');
            }
        });
    }
}
exports.default = new VerificationRequestRepository();
