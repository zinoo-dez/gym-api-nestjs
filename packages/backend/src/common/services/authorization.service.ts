import { Injectable, ForbiddenException } from '@nestjs/common';
import { Role } from '@prisma/client';

export interface AuthUser {
  userId: string;
  email: string;
  role: Role;
}

@Injectable()
export class AuthorizationService {
  /**
   * Check if user can access a resource (self-only for MEMBER/TRAINER)
   */
  canAccessResource(
    currentUser: AuthUser,
    resourceUserId: string,
    resourceType: string,
  ): void {
    // Admins and SuperAdmins can access everything
    if (
      currentUser.role === Role.ADMIN ||
      currentUser.role === Role.SUPERADMIN
    ) {
      return;
    }

    // Members and Trainers can only access their own resources
    if (currentUser.userId !== resourceUserId) {
      throw new ForbiddenException(
        `You can only access your own ${resourceType}`,
      );
    }
  }

  /**
   * Check if user can modify a resource (self-only for MEMBER/TRAINER)
   */
  canModifyResource(
    currentUser: AuthUser,
    resourceUserId: string,
    resourceType: string,
  ): void {
    // Admins and SuperAdmins can modify everything
    if (
      currentUser.role === Role.ADMIN ||
      currentUser.role === Role.SUPERADMIN
    ) {
      return;
    }

    // Members and Trainers can only modify their own resources
    if (currentUser.userId !== resourceUserId) {
      throw new ForbiddenException(
        `You can only modify your own ${resourceType}`,
      );
    }
  }

  /**
   * Check if trainer has access to a member (via workout plan assignment)
   */
  canTrainerAccessMember(currentUser: AuthUser, isAssigned: boolean): boolean {
    if (
      currentUser.role === Role.ADMIN ||
      currentUser.role === Role.SUPERADMIN
    ) {
      return true;
    }

    if (currentUser.role === Role.TRAINER) {
      return isAssigned;
    }

    return false;
  }

  /**
   * Check if user is admin or superadmin
   */
  isAdmin(currentUser: AuthUser): boolean {
    return (
      currentUser.role === Role.ADMIN || currentUser.role === Role.SUPERADMIN
    );
  }

  /**
   * Check if user is trainer
   */
  isTrainer(currentUser: AuthUser): boolean {
    return currentUser.role === Role.TRAINER;
  }

  /**
   * Check if user is member
   */
  isMember(currentUser: AuthUser): boolean {
    return currentUser.role === Role.MEMBER;
  }
}
