import bcrypt from 'bcryptjs';

export async function hashing(password: string): Promise<string> {
  return bcrypt.hash(password, 10);
}

export async function hashMatch(plainPassword: string, hashedPassword: string): Promise<boolean> {
  return bcrypt.compare(plainPassword, hashedPassword);
}
