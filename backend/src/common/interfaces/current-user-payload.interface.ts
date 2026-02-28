import { UserRole } from '@prisma/client';

/**
 * Represents the authenticated user payload extracted from the JWT token.
 * Returned by JwtStrategy.validate() and injected via @CurrentUser() decorator.
 */
export interface CurrentUserPayload {
    /** User ID (same as userId, kept for backward compatibility) */
    id: string;
    /** User ID */
    userId: string;
    /** User email address */
    email: string;
    /** User role (ADMIN, OWNER, STAFF, TRAINER, MEMBER) */
    role: UserRole;
    /** Member profile ID (only present for MEMBER role) */
    memberId?: string;
}
