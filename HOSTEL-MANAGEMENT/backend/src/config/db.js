import mongoose from 'mongoose';

export async function connectToDatabase() {
  const mongodbUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/hostel_management';
  mongoose.set('strictQuery', true);
  await mongoose.connect(mongodbUri, {
    serverSelectionTimeoutMS: 15000,
  });
  console.log('Connected to MongoDB');
}


