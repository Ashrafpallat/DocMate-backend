// utils/messages.ts

export const Messages = {
    Doctor: {
      AUTH_SUCCESS: 'User authenticated',
      SIGNUP_SUCCESS: 'Doctor registered successfully',
      LOGIN_SUCCESS: 'Login successful',
      LOGOUT_SUCCESS: 'Logout successful',
      VERIFICATION_REQUEST_SUCCESS: 'Verification request submitted successfully',
      PROFILE_FETCH_SUCCESS: 'Doctor profile fetched successfully',
      PROFILE_UPDATE_SUCCESS: 'Doctor profile updated successfully',
      DEFAULT_TOKENS_SAVED: (day: string) => `Default tokens for ${day} saved successfully`,
      PRESCRIPTION_SAVED: 'Prescription saved successfully',
      SLOT_FETCH_SUCCESS: 'Slots fetched successfully',
      REVIEWS_FETCH_SUCCESS: 'Reviews fetched successfully',
    },
    Errors: {
      INTERNAL_SERVER_ERROR: 'Internal server error',
      GOOGLE_AUTH_FAILED: 'Error processing Google authentication',
      SIGNUP_FAILED: 'Internal server error during signup',
      LOGIN_FAILED: 'Login failed',
      LOGOUT_FAILED: 'Server error during logout',
      VERIFICATION_FAILED: 'Internal server error during verification',
      PROFILE_FETCH_FAILED: 'Error fetching doctor profile',
      PROFILE_UPDATE_FAILED: 'Error updating doctor profile',
      FAILED_TO_SAVE_TOKENS: 'Error saving default tokens',
      FAILED_TO_FETCH_SLOTS: 'Error fetching doctor slots',
      PRESCRIPTION_FAILED: 'Error saving prescription',
      SLOT_FETCH_FAILED: 'Error fetching slots',
      REVIEW_FETCH_FAILED: 'Error fetching reviews',
      ACCOUNT_BLOCKED: 'You account has been blocked',
      PROOF_FILE_REQUIRED: 'Proof file is required',
      DOCTOR_NOT_FOUND: 'Doctor not found',
      DOCTOR_ID_MISSING: 'Doctor id is missing',
    },
  };
  