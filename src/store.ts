export interface User {
  id: number;
  name: string;
  email: string;
  password: string;
  role: string;
  createdAt: Date;
}

export const users: User[] = [];
export let nextId = 1;

export function incrementId(): number {
  return nextId++;
}
