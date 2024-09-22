import jwt from 'jsonwebtoken';

export const adminService = {
  async loginAdmin(email: string, password: string) {
    // Fetch the default admin credentials from .env
    const adminEmail = process.env.ADMIN_EMAIL 
    const adminPassword = process.env.ADMIN_PASSWORD 
    // Check if the provided email matches the .env admin email
    if (email !== adminEmail) {
      throw new Error('Invalid email or password');
    }

    // Compare the provided password with the one in the .env file
    if (password !== adminPassword) {
      throw new Error('Invalid email or password');
    }

    // Generate a JWT token for the admin
    const token = jwt.sign(
      { email: adminEmail, role: 'admin' },
      process.env.JWT_SECRET || 'fallback-secret', // Use a secret from environment variables
      { expiresIn: '30d' } // Token expires in 30 days
    );

    // Return the token and admin details
    return {
      admin: {
        email: adminEmail,
        name: 'DocMate Admin'
      },
      token
    };
  }
};
