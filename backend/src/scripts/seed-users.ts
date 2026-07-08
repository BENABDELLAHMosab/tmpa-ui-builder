import mongoose from 'mongoose';
import dotenv from 'dotenv';
import bcrypt from 'bcryptjs';
import User from '../models/user.model';

dotenv.config();

const seedUsers = async () => {
  try {
    const mongoUri = process.env.MONGO_URI || 'mongodb://localhost:27017/tmpa_ui_builder';
    await mongoose.connect(mongoUri);
    console.log('Connected to MongoDB for seeding...');

    const adminEmail = 'admin@tmpa.ma';
    const devEmail = 'developer@tmpa.ma';

    // Admin
    const adminPasswordHash = await bcrypt.hash('admin123', 10);
    await User.findOneAndUpdate(
      { email: adminEmail },
      {
        fullName: 'TMPA Admin',
        email: adminEmail,
        passwordHash: adminPasswordHash,
        role: 'admin'
      },
      { upsert: true, new: true }
    );
    console.log('Admin user seeded/updated.');

    // Developer
    const devPasswordHash = await bcrypt.hash('dev123', 10);
    await User.findOneAndUpdate(
      { email: devEmail },
      {
        fullName: 'TMPA Developer',
        email: devEmail,
        passwordHash: devPasswordHash,
        role: 'user-developer'
      },
      { upsert: true, new: true }
    );
    console.log('Developer user seeded/updated.');

    console.log('Seeding completed successfully.');
  } catch (error) {
    console.error('Error during seeding:', error);
  } finally {
    await mongoose.connection.close();
    console.log('MongoDB connection closed.');
  }
};

seedUsers();
