import IVerificationRequest from '../interfaces/verificationInterface';
import { Doctor } from '../models/doctorModel';
import VerificationRequest from '../models/verificationModel'; // Assuming this is your Mongoose model
import { Document } from 'mongoose';

class VerificationRequestRepository {
    // Fetch pending verification requests (not yet approved)
    // Fetch pending verification requests (not yet approved)
async getPendingRequests(): Promise<IVerificationRequest[]> {
    try {
        // Find all requests where 'approved' is false
        const pendingRequests = await VerificationRequest.find();

        // Cast the result to IVerificationRequest[] to avoid type error
        return pendingRequests.map((request: Document) => request.toObject()) as IVerificationRequest[];
    } catch (error) {
        console.error('Error fetching pending verification requests:', error);
        throw new Error('Could not fetch pending verification requests');
    }
}


    // Approve a verification request by its ID
 // Approve a verification request by its ID
async approveRequest(id: string): Promise<IVerificationRequest | null> {
    try {
        // Find the verification request to get the doctor's name
        const approvedRequest = await VerificationRequest.findOne({ doctorId: id });

        // Check if the approvedRequest was found
        if (!approvedRequest) {
            throw new Error('Verification request not found');
        }

        // Get the doctor's name from the approved request
        const doctorId = approvedRequest.doctorId;

        // Update the doctor's KYC verification status
        await Doctor.findByIdAndUpdate(
            { _id: doctorId }, // Update the doctor based on the name
            { kycVerified: true }, // Set kycVerified to true
            { new: true } // Return the updated doctor document
        );

        // Delete the verification request after processing
        await VerificationRequest.findOneAndDelete({ doctorId: id });

        // Return the approved request or null if needed
        return approvedRequest as unknown as IVerificationRequest; // Explicit casting
    } catch (error) {
        console.error('Error approving the verification request:', error);
        throw new Error('Could not approve the verification request');
    }
}
  
}

export default new VerificationRequestRepository();
