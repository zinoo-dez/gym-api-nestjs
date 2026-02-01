import { Role } from '@prisma/client';

export interface JwtPayload {
  sub: string; // user ID
  email: string;
  role: Role;
}
