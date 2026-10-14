/**
 * Initialise un premier administrateur sans identifiants pré-définis.
 * À lancer manuellement UNE SEULE FOIS à partir du répertoire backend.
 * Ne jamais appeler seed-users.ts sur une base de production.
 */
import dotenv from 'dotenv';
import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import User from '../models/user.model';

dotenv.config();

async function main(): Promise<void> {
  const uri = process.env.MONGO_URI;
  const email = process.env.SEED_ADMIN_EMAIL?.trim().toLowerCase();
  const password = process.env.SEED_ADMIN_PASSWORD;
  const fullName = process.env.SEED_ADMIN_NAME?.trim() || 'Administrateur TMPA';

  if (!uri || !email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) || !password || password.length < 12) {
    throw new Error('MONGO_URI, SEED_ADMIN_EMAIL et SEED_ADMIN_PASSWORD (12 caractères minimum) sont obligatoires.');
  }

  await mongoose.connect(uri);
  try {
    if (await User.exists({ email })) {
      throw new Error('Un utilisateur existe déjà avec cette adresse. Aucun mot de passe ne sera modifié.');
    }
    const passwordHash = await bcrypt.hash(password, 12);
    await User.create({ fullName, email, passwordHash, role: 'admin', accountStatus: 'active' });
    console.log('Administrateur créé. Conservez les identifiants hors du dépôt Git.');
  } finally {
    await mongoose.disconnect();
  }
}

main().catch((error: unknown) => {
  console.error('Initialisation impossible :', error instanceof Error ? error.message : error);
  process.exitCode = 1;
});
