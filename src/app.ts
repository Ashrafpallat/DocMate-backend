import express from 'express';
import mongoose from 'mongoose';
import doctorRoutes from './routes/doctorRoutes';
import patientRoutes from './routes/patientRoutes';
import dotenv from 'dotenv';
import cors from 'cors'
import adminRouter from './routes/adminRoutes';
import cookieParser from 'cookie-parser';
import { Doctor } from './models/doctorModel';
dotenv.config();

const app = express();
app.use(cookieParser());

app.use(cors({
  origin: 'http://localhost:5173', // Replace with your frontend URL
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true // Allow credentials (cookies) to be sent
}));
app.use(express.json());  

app.use('/api/admin', adminRouter);
app.use('/api/doctor', doctorRoutes);
app.use('/api/patient', patientRoutes);


// Connect to MongoDB
mongoose
  .connect(process.env.MONGO_URI as string)
  .then(() => console.log('MongoDB connected'))
  .catch(err => console.log('MongoDB connection error', err));

  // Create the index (this will create the index on the existing documents)
Doctor.init().then(() => {
  console.log('Geospatial index created!');
}).catch(err => {
  console.error('Error creating index:', err);
});
 
// Start the server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
