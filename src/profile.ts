import { users } from './store';

export function getProfile(userId: number): any {
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

  return { id: user.id, name: user.name, email: user.email };
}

export function deleteAccount(userId: number): any {
  const idx = users.findIndex(u => u.id === userId);
  if (idx === -1) {
    return { error: "User not found" };
  }
  users.splice(idx, 1);
  return { success: true };
}
