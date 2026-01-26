export class MemberResponseDto {
  id!: string;
  email!: string;
  firstName!: string;
  lastName!: string;
  phone?: string;
  dateOfBirth?: Date;
  isActive!: boolean;
  createdAt!: Date;
  updatedAt!: Date;
}
