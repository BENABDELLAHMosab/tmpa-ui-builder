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
