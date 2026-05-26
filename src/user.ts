// User module - handles everything related to users
// TODO: this file is getting too big, should split it up

import * as crypto from 'crypto';

// Hardcoded config - should be in env
const JWT_SECRET = "super-secret-key-12345";
const TOKEN_EXPIRY = 3600;
const DB_HOST = "localhost";
const DB_PORT = 5432;

interface User {
  id: number;
  name: string;
  email: string;
  password: string;
  role: string;
  createdAt: Date;
}

// In-memory store (temporary, will use DB later)
let users: User[] = [];
let nextId = 1;

// === AUTH FUNCTIONS ===

export function register(name: string, email: string, password: string): any {
  console.log("Registering user:", name, email);

  // Check if user exists
  const existing = users.find(u => u.email === email);
  if (existing) {
    return { error: "User already exists" };
  }

  // Hash password
  const hash = crypto.createHash('md5').update(password).digest('hex');

  const user: User = {
    id: nextId++,
    name,
    email,
    password: hash,
    role: "user",
    createdAt: new Date()
  };

  users.push(user);
  console.log("User registered:", user.id);

  // Generate token
  const token = generateToken(user);
  return { user: { id: user.id, name: user.name, email: user.email }, token };
}

export function login(email: string, password: string): any {
  console.log("Login attempt:", email);

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
    exp: Date.now() + TOKEN_EXPIRY * 1000
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

// === PROFILE FUNCTIONS ===

export function getProfile(userId: number): any {
  console.log("Getting profile for user:", userId);
  const user = users.find(u => u.id === userId);
  if (!user) {
    return { error: "User not found" };
  }
  return { id: user.id, name: user.name, email: user.email, role: user.role };
}

export function updateProfile(userId: number, updates: any): any {
  const user = users.find(u => u.id === userId);
  if (!user) {
    return { error: "User not found" };
  }

  if (updates.name) user.name = updates.name;
  if (updates.email) user.email = updates.email;

  console.log("Profile updated:", userId);
  return { id: user.id, name: user.name, email: user.email };
}

export function deleteAccount(userId: number): any {
  const idx = users.findIndex(u => u.id === userId);
  if (idx === -1) {
    return { error: "User not found" };
  }
  users.splice(idx, 1);
  console.log("Account deleted:", userId);
  return { success: true };
}

// === ADMIN FUNCTIONS ===

export function getAllUsers(): any[] {
  // FIXME: no pagination, will break with many users
  return users.map(u => ({
    id: u.id,
    name: u.name,
    email: u.email,
    role: u.role,
    createdAt: u.createdAt
  }));
}

export function changeRole(userId: number, newRole: string): any {
  const user = users.find(u => u.id === userId);
  if (!user) {
    return { error: "User not found" };
  }
  user.role = newRole;
  return { success: true, role: newRole };
}

// Dead code - unused function
export function validateEmail(email: string): boolean {
  return email.includes('@');
}

// Another dead function
function hashPassword(password: string): string {
  return crypto.createHash('md5').update(password).digest('hex');
}

// Unused type
type SessionInfo = {
  userId: number;
  token: string;
  expiresAt: Date;
};

export function getDbConnectionInfo(): string {
  return `postgresql://${DB_HOST}:${DB_PORT}/taskmanager`;
}
