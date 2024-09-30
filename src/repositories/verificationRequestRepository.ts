import { Doctor } from '../models/doctorModel';
import VerificationRequest from '../models/verificationModel'; // Assuming this is your Mongoose model
import { Document } from 'mongoose';

// Define the shape of the verification request
interface IVerificationRequest extends Document {
    name: string;
    regNo: string;
    yearOfReg: string;
    medicalCouncil: string;
    proofFile: string;
}

class VerificationRequestRepository {
    // Fetch pending verification requests (not yet approved)
    async getPendingRequests(): Promise<IVerificationRequest[]> {
        try {
            // Find all requests where 'approved' is false
            const pendingRequests = await VerificationRequest.find();  
            console.log(pendingRequests);
                      
            return pendingRequests;
        } catch (error) {
            console.error('Error fetching pending verification requests:', error);
            throw new Error('Could not fetch pending verification requests');
        }
    }

    // Approve a verification request by its ID
    async approveRequest(id: string): Promise<IVerificationRequest | null> {
        try {
            // Find the verification request to get the doctor's name
            
            const approvedRequest = await VerificationRequest.findOne({ doctorId:id });
    
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
            return approvedRequest; 
        } catch (error) {
            console.error('Error approving the verification request:', error);
            throw new Error('Could not approve the verification request');
        }
    }    
}

export default new VerificationRequestRepository();
