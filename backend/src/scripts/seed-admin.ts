import dotenv from 'dotenv';
import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import User from '../models/user.model';
dotenv.config();

async function main(): Promise<void> {
  const uri = process.env.MONGO_URI;
  const email = process.env.SEED_ADMIN_EMAIL?.trim().toLowerCase();
  const password = process.env.SEED_ADMIN_PASSWORD;
  if (!uri || !email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) || !password || password.length < 12) {
    throw new Error('MONGO_URI, SEED_ADMIN_EMAIL et SEED_ADMIN_PASSWORD (min. 12 caractères) requis');
  }
  await mongoose.connect(uri);
  try {
    if (await User.exists({ email })) throw new Error('Un utilisateur existe déjà : aucun écrasement');
    await User.create({ fullName: process.env.SEED_ADMIN_NAME || 'Administrateur TMPA', email, passwordHash: await bcrypt.hash(password, 12), role: 'admin', accountStatus: 'active' });
    console.log('Administrateur créé');
  } finally {
    await mongoose.disconnect();
  }
}
main().catch(err => { console.error(err); process.exitCode = 1; });
