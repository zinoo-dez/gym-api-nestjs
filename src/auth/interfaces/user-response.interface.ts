import { Role } from '@prisma/client';

export interface UserResponse {
  id: string;
  email: string;
  role: Role;
  createdAt: Date;
  updatedAt: Date;
}
