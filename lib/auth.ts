import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import { query } from './db';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';
const JWT_REFRESH_SECRET = process.env.JWT_REFRESH_SECRET || 'your-refresh-secret-key';

export interface User {
  id: number;
  email: string;
  name: string;
  role: string;
  location_id?: number;
}

export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 10);
}

export async function comparePassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash);
}

export function generateToken(user: User): string {
  return jwt.sign(
    { id: user.id, email: user.email, role: user.role },
    JWT_SECRET,
    { expiresIn: '1h' }
  );
}

export function generateRefreshToken(user: User): string {
  return jwt.sign(
    { id: user.id, email: user.email },
    JWT_REFRESH_SECRET,
    { expiresIn: '7d' }
  );
}

export function verifyToken(token: string): any {
  try {
    return jwt.verify(token, JWT_SECRET);
  } catch (error) {
    return null;
  }
}

export async function authenticateUser(email: string, password: string): Promise<User | null> {
  const results: any = await query(
    'SELECT id, email, password, name, role, location_id FROM users WHERE email = ?',
    [email]
  );

  if (results.length === 0) {
    return null;
  }

  const user = results[0];
  const isValid = await comparePassword(password, user.password);

  if (!isValid) {
    return null;
  }

  return {
    id: user.id,
    email: user.email,
    name: user.name,
    role: user.role,
    location_id: user.location_id,
  };
}

export async function getUserById(id: number): Promise<User | null> {
  const results: any = await query(
    'SELECT id, email, name, role, location_id FROM users WHERE id = ?',
    [id]
  );

  if (results.length === 0) {
    return null;
  }

  const user = results[0];
  return {
    id: user.id,
    email: user.email,
    name: user.name,
    role: user.role,
    location_id: user.location_id,
  };
}

