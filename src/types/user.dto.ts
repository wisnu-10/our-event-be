import type { Role } from '@prisma/client';

export interface ManagedUserDTO {
  id: string;
  name: string;
  email: string;
  role: Role;
  createdAt: Date;
}
