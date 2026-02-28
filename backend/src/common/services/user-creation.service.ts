import { Injectable, ConflictException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import * as bcrypt from 'bcrypt';
import { UserRole, UserStatus, Prisma } from '@prisma/client';

/** Common fields for creating a new user across all roles. */
export interface CreateUserData {
    email: string;
    password: string;
    firstName: string;
    lastName: string;
    role: UserRole;
    phone?: string;
    address?: string;
    avatarUrl?: string;
    status?: UserStatus;
}

/**
 * Centralized service for user creation, password hashing, and email uniqueness checks.
 * Eliminates duplicated user creation logic across auth, members, trainers, and staff services.
 */
@Injectable()
export class UserCreationService {
    private readonly SALT_ROUNDS = 10;

    constructor(private readonly prisma: PrismaService) { }

    /**
     * Hash a plain-text password with a consistent salt round.
     */
    async hashPassword(password: string): Promise<string> {
        return bcrypt.hash(password, this.SALT_ROUNDS);
    }

    /**
     * Compare a plain-text password against a hashed password.
     */
    async comparePasswords(
        password: string,
        hashedPassword: string,
    ): Promise<boolean> {
        return bcrypt.compare(password, hashedPassword);
    }

    /**
     * Check if a user with the given email already exists. Throws ConflictException if so.
     */
    async ensureEmailUnique(email: string): Promise<void> {
        const existing = await this.prisma.user.findUnique({
            where: { email },
        });
        if (existing) {
            throw new ConflictException('User with this email already exists');
        }
    }

    /**
     * Create a user record in a Prisma transaction.
     * Call this inside a $transaction callback to keep user + profile creation atomic.
     */
    async createUserInTransaction(
        tx: Prisma.TransactionClient,
        data: CreateUserData,
    ) {
        const hashedPassword = await this.hashPassword(data.password);

        return tx.user.create({
            data: {
                email: data.email,
                password: hashedPassword,
                firstName: data.firstName,
                lastName: data.lastName,
                role: data.role,
                phone: data.phone,
                address: data.address,
                avatarUrl: data.avatarUrl ?? '',
                status: data.status ?? UserStatus.ACTIVE,
            },
        });
    }

    /**
     * Complete flow: check email uniqueness + create user + profile in a single transaction.
     * Returns the created user and the result of the profileCreator callback.
     */
    async createUserWithProfile<TProfile>(
        data: CreateUserData,
        profileCreator: (
            tx: Prisma.TransactionClient,
            userId: string,
        ) => Promise<TProfile>,
    ): Promise<{ user: Awaited<ReturnType<UserCreationService['createUserInTransaction']>>; profile: TProfile }> {
        await this.ensureEmailUnique(data.email);

        return this.prisma.$transaction(async (tx) => {
            const user = await this.createUserInTransaction(tx, data);
            const profile = await profileCreator(tx, user.id);
            return { user, profile };
        });
    }
}
