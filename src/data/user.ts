export interface User {
  id: number;
  name: string;
  email: string;
  password: string;
}

// Our temporary "database": just a list in memory.
// NOTE: Plain-text passwords are ONLY for learning.
// In Step 2 we'll store hashed passwords in a real database.
export const users: User[] = [
  { id: 1, name: 'Ali', email: 'ali@example.com', password: '123456' },
  { id: 2, name: 'Sara', email: 'sara@example.com', password: 'password' },
];