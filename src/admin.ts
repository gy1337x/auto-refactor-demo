import { users } from './store';
import { config } from './config';

export function getAllUsers(): any[] {
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

export function getDbConnectionInfo(): string {
  return `postgresql://${config.dbHost}:${config.dbPort}/taskmanager`;
}
