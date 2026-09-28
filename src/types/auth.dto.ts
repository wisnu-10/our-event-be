import type { Role } from '@prisma/client';

export interface AuthPayload {
  id: string;
  role: Role;
}

export interface RegisterDTO {
  name: string;
  email: string;
  password: string;
}

export interface LoginDTO {
  email: string;
  password: string;
}
