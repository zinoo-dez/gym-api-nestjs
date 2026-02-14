import { StaffRole } from '@prisma/client';

export class StaffResponseDto {
  id!: string;
  email!: string;
  firstName!: string;
  lastName!: string;
  phone?: string;
  address?: string;
  avatarUrl?: string;
  staffRole!: StaffRole;
  employeeId!: string;
  hireDate!: Date;
  department?: string;
  position!: string;
  emergencyContact?: string;
  isActive!: boolean;
  createdAt!: Date;
  updatedAt!: Date;
}
