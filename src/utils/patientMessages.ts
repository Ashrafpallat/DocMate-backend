// utils/messages.ts

export const Messages = {
    Success: {
        USER_REGISTERED: 'User registered successfully',
        LOGIN_SUCCESSFUL: 'Login successful',
        USER_AUTHENTICATED: 'User authenticated',
        PROFILE_UPDATED: 'Profile updated successfully',
        SLOT_RESERVED: 'Slot reserved successfully',
        APPOINTMENTS_FETCHED: 'Appointments fetched successfully',
        REVIEW_ADDED: 'Review added successfully',
        PAYMENT_SESSION_CREATED: 'Payment session created successfully',
        LOGOUT_SUCCESSFUL: 'Logout successful',
        DOCTOR_PROFILE: 'Doctor profile fetched successfully',
        NEW_ACCESSTOKEN: 'New access token issued',
    },
    Errors: {
        NO_REFRESH_TOKEN: 'No refresh token provided',
        INTERNAL_SERVER_ERROR: 'Internal server error',
        INVALID_REFRESH_TOKEN: 'Invalid or expired refresh token',
        AUTHENTICATION_REQUIRED: 'Authentication required',
        ACCOUNT_BLOCKED: 'Your account has been blocked',
        BAD_REQUEST: 'Bad request',
        PATIENT_NOT_FOUND: 'Patient not found',
        SLOT_RESERVATION_FAILED: 'Failed to reserve slot',
        INVALID_LAT_LNG: 'Invalid latitude or longitude',
        PAYMENT_SESSION_FAILED: 'Could not create payment session',
        NO_PENDING_APPOINTMENTS: 'No pending appointments found',
        PRESCRIPTION_FETCH_FAILED: 'Failed to fetch prescriptions',
        REVIEW_ADD_FAILED: 'Failed to add review',
    }
};
