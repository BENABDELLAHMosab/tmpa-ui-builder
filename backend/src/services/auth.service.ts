import User from '../models/user.model';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

export const login = async (email: string, password: string) => {
  const user = await User.findOne({ email });
  if (!user) {
    throw new Error('Invalid email or password');
  }

  const isPasswordValid = await bcrypt.compare(password, user.passwordHash);
  if (!isPasswordValid) {
    throw new Error('Invalid email or password');
  }

  const secret = process.env.JWT_SECRET || 'fallback_secret';
  const token = jwt.sign(
    { userId: user._id, email: user.email, role: user.role },
    secret,
    { expiresIn: '1h' }
  );

  return {
    accessToken: token,
    user: {
      id: user._id,
      fullName: user.fullName,
      email: user.email,
      role: user.role
    }
  };
};

export interface CreateDeveloperInput {
  fullName: string;
  email: string;
  password: string;
}

export const createDeveloper = async (input: CreateDeveloperInput) => {
  const trimmedFullName = typeof input.fullName === 'string' ? input.fullName.trim() : '';
  const normalizedEmail = typeof input.email === 'string' ? input.email.trim().toLowerCase() : '';
  const password = typeof input.password === 'string' ? input.password : '';

  if (!trimmedFullName) {
    const error: any = new Error('Full name is required');
    error.statusCode = 400;
    throw error;
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!normalizedEmail || !emailRegex.test(normalizedEmail)) {
    const error: any = new Error('A valid email address is required');
    error.statusCode = 400;
    throw error;
  }

  if (!password || password.length < 8) {
    const error: any = new Error('Password must be at least 8 characters long');
    error.statusCode = 400;
    throw error;
  }

  const existingUser = await User.findOne({ email: normalizedEmail });
  if (existingUser) {
    const error: any = new Error('An account with this email already exists');
    error.statusCode = 409;
    throw error;
  }

  const passwordHash = await bcrypt.hash(password, 10);

  const newUser = await User.create({
    fullName: trimmedFullName,
    email: normalizedEmail,
    passwordHash,
    role: 'user-developer'
  });

  return {
    id: newUser._id,
    fullName: newUser.fullName,
    email: newUser.email,
    role: newUser.role,
    createdAt: newUser.createdAt
  };
};
