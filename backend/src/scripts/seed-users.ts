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
        $setOnInsert: {
          fullName: 'TMPA Admin',
          email: adminEmail,
          passwordHash: adminPasswordHash,
          role: 'admin'
        }
      },
      { upsert: true, new: true }
    );
    console.log('Admin user ready (created if missing).');

    // Developer
    const devPasswordHash = await bcrypt.hash('dev123', 10);
    await User.findOneAndUpdate(
      { email: devEmail },
      {
        $setOnInsert: {
          fullName: 'TMPA Developer',
          email: devEmail,
          passwordHash: devPasswordHash,
          role: 'user-developer'
        }
      },
      { upsert: true, new: true }
    );
    console.log('Developer user ready (created if missing).');

    console.log('Seeding completed successfully.');
  } catch (error) {
    console.error('Error during seeding:', error);
    process.exitCode = 1;
  } finally {
    await mongoose.connection.close();
    console.log('MongoDB connection closed.');
  }
};

seedUsers();
