import { Injectable, ForbiddenException } from '@nestjs/common';
import { UserRole } from '@prisma/client';

export interface AuthUser {
  userId: string;
  email: string;
  role: UserRole;
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
    // Admins can access everything
    if (currentUser.role === UserRole.ADMIN) {
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
    // Admins can modify everything
    if (currentUser.role === UserRole.ADMIN) {
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
    if (currentUser.role === UserRole.ADMIN) {
      return true;
    }

    if (currentUser.role === UserRole.TRAINER) {
      return isAssigned;
    }

    return false;
  }

  /**
   * Check if user is admin
   */
  isAdmin(currentUser: AuthUser): boolean {
    return currentUser.role === UserRole.ADMIN;
  }

  /**
   * Check if user is trainer
   */
  isTrainer(currentUser: AuthUser): boolean {
    return currentUser.role === UserRole.TRAINER;
  }

  /**
   * Check if user is member
   */
  isMember(currentUser: AuthUser): boolean {
    return currentUser.role === UserRole.MEMBER;
  }
}
