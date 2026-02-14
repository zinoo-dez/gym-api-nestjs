import { UserRole } from '@prisma/client';

export interface UserResponse {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  address?: string;
  avatarUrl?: string;
  role: UserRole;
  createdAt: Date;
  updatedAt: Date;
}
