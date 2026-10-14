import mongoose from 'mongoose';
import User, { AccountStatus } from '../models/user.model';
import Page from '../models/page.model';
import PageVersion from '../models/pageVersion.model';
import PageReview from '../models/pageReview.model';
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

  const accountStatus = user.accountStatus || 'active';
  if (user.role === 'user-developer' && accountStatus === 'suspended') {
    const error: any = new Error('Votre compte est suspendu. Contactez l’administrateur.');
    error.code = 'ACCOUNT_SUSPENDED';
    error.statusCode = 403;
    throw error;
  }

  const secret = process.env.JWT_SECRET;
  if (!secret) throw new Error('JWT_SECRET non configuré');
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
      role: user.role,
      accountStatus
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
    role: 'user-developer',
    accountStatus: 'active'
  });

  return {
    id: newUser._id,
    fullName: newUser.fullName,
    email: newUser.email,
    role: newUser.role,
    accountStatus: newUser.accountStatus || 'active',
    createdAt: newUser.createdAt
  };
};

export const getDevelopers = async () => {
  const developers = await User.find({ role: 'user-developer' })
    .sort({ createdAt: -1 })
    .select('_id fullName email role accountStatus createdAt updatedAt')
    .lean();

  return developers.map((u) => ({
    id: u._id.toString(),
    fullName: u.fullName,
    email: u.email,
    role: u.role,
    accountStatus: u.accountStatus || 'active',
    createdAt: u.createdAt,
    updatedAt: u.updatedAt
  }));
};

export const updateDeveloperStatus = async (userId: string, accountStatus: AccountStatus) => {
  if (!mongoose.Types.ObjectId.isValid(userId)) {
    const error: any = new Error('Invalid user ID');
    error.statusCode = 400;
    throw error;
  }

  if (accountStatus !== 'active' && accountStatus !== 'suspended') {
    const error: any = new Error("Invalid account status. Allowed values: 'active', 'suspended'");
    error.statusCode = 400;
    throw error;
  }

  const user = await User.findOne({ _id: userId, role: 'user-developer' });
  if (!user) {
    const error: any = new Error('Developer not found');
    error.statusCode = 404;
    throw error;
  }

  user.accountStatus = accountStatus;
  await user.save();

  return {
    id: user._id.toString(),
    fullName: user.fullName,
    email: user.email,
    role: user.role,
    accountStatus: user.accountStatus || 'active',
    createdAt: user.createdAt,
    updatedAt: user.updatedAt
  };
};

export const deleteDeveloper = async (userId: string) => {
  if (!mongoose.Types.ObjectId.isValid(userId)) {
    const error: any = new Error('Invalid user ID');
    error.statusCode = 400;
    throw error;
  }

  const user = await User.findOne({ _id: userId, role: 'user-developer' });
  if (!user) {
    const error: any = new Error('Developer not found');
    error.statusCode = 404;
    throw error;
  }

  const hasPages = await Page.findOne({
    $or: [{ ownerId: userId }, { reviewedBy: userId }, { publishedBy: userId }]
  }).select('_id').lean();

  const hasVersions = await PageVersion.findOne({ createdBy: userId }).select('_id').lean();

  const hasReviews = await PageReview.findOne({
    $or: [{ submittedBy: userId }, { reviewedBy: userId }, { publishedBy: userId }]
  }).select('_id').lean();

  if (hasPages || hasVersions || hasReviews) {
    const error: any = new Error('This developer cannot be deleted because they have existing pages or review history. Suspend the account instead.');
    error.code = 'DEVELOPER_HAS_DEPENDENCIES';
    error.statusCode = 409;
    throw error;
  }

  await User.deleteOne({ _id: userId });
};
