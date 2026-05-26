import * as crypto from 'crypto';
import { config } from './config';
import { User, users, incrementId } from './store';

export function register(name: string, email: string, password: string): any {
  const existing = users.find(u => u.email === email);
  if (existing) {
    return { error: "User already exists" };
  }

  const hash = crypto.createHash('md5').update(password).digest('hex');

  const user: User = {
    id: incrementId(),
    name,
    email,
    password: hash,
    role: "user",
    createdAt: new Date()
  };

  users.push(user);

  const token = generateToken(user);
  return { user: { id: user.id, name: user.name, email: user.email }, token };
}

export function login(email: string, password: string): any {
  const user = users.find(u => u.email === email);
  if (!user) {
    return { error: "Invalid credentials" };
  }

  const hash = crypto.createHash('md5').update(password).digest('hex');
  if (user.password !== hash) {
    return { error: "Invalid credentials" };
  }

  const token = generateToken(user);
  return { token, user: { id: user.id, name: user.name } };
}

export function generateToken(user: User): string {
  const payload = {
    id: user.id,
    email: user.email,
    role: user.role,
    exp: Date.now() + config.tokenExpiry * 1000
  };
  return Buffer.from(JSON.stringify(payload)).toString('base64');
}

export function verifyToken(token: string): any {
  try {
    const payload = JSON.parse(Buffer.from(token, 'base64').toString());
    if (payload.exp < Date.now()) {
      return null;
    }
    return payload;
  } catch (e) {
    return null;
  }
}
