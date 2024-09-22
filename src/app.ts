import express from 'express';
import mongoose from 'mongoose';
import doctorRoutes from './routes/doctorRoutes';
import patientRoutes from './routes/patientRoutes';
import dotenv from 'dotenv';
import cors from 'cors'

dotenv.config();

const app = express();

app.use(cors({
  origin: '*', // Allow all origins, change this based on your needs
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));
app.use(express.json());  

app.use('/api/doctor', doctorRoutes);
app.use('/api/patient', patientRoutes);


// Connect to MongoDB
mongoose
  .connect(process.env.MONGO_URI as string)
  .then(() => console.log('MongoDB connected'))
  .catch(err => console.log('MongoDB connection error', err));

// Start the server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
