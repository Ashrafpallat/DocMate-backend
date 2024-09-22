import dotenv from 'dotenv';
dotenv.config();

class AdminRepository {
  async findAdminByEmail(email: string) {
    if (email === process.env.ADMIN_EMAIL) {
      return {
        email: process.env.ADMIN_EMAIL,
        password: process.env.ADMIN_PASSWORD, // This would be the hashed password in production
      };
    }

    // If no match found, return null
    return null;
  }
}

export const adminRepository = new AdminRepository();
