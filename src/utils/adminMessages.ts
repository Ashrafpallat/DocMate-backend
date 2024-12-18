export const Messages = {
  Admin: {
    LOGIN_SUCCESS: 'Admin login successful',
    LOGOUT_SUCCESS: 'Logout successful',
    FETCH_DOCTORS_SUCCESS: 'Doctors fetched successfully',
    FETCH_PATIENTS_SUCCESS: 'Patients fetched successfully',
    PATIENT_STATUS_UPDATED: 'Patient status updated successfully',
    DOCTOR_STATUS_UPDATED: (status: string) =>
      `Doctor ${status === 'Active' ? 'unblocked' : 'blocked'} successfully`,
    PENDING_VERIFICATIONS_FETCH_SUCCESS: 'Pending verifications fetched successfully',
    DOCTOR_APPROVED_SUCCESS: 'Doctor approved successfully',
  },
  Errors: {
    INTERNAL_SERVER_ERROR: 'Internal server error',
    FAILED_TO_FETCH_DOCTORS: 'Failed to fetch doctors',
    FAILED_TO_UPDATE_DOCTOR_STATUS: 'Failed to update doctor status',
    PATIENT_NOT_FOUND: 'Patient not found',
    DOCTOR_NOT_FOUND: 'Doctor not found',
    VERIFICATION_NOT_FOUND: 'Verification request not found',
  },
};
