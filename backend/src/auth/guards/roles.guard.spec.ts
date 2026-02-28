import { Test, TestingModule } from '@nestjs/testing';
import { Reflector } from '@nestjs/core';
import { ExecutionContext } from '@nestjs/common';
import { UserRole } from '@prisma/client';
import { RolesGuard } from './roles.guard';

describe('RolesGuard', () => {
    let guard: RolesGuard;
    let reflector: Reflector;

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [
                RolesGuard,
                {
                    provide: Reflector,
                    useValue: {
                        getAllAndOverride: jest.fn(),
                    },
                },
            ],
        }).compile();

        guard = module.get<RolesGuard>(RolesGuard);
        reflector = module.get<Reflector>(Reflector);
    });

    const createMockContext = (userRole?: UserRole): ExecutionContext => {
        return {
            switchToHttp: () => ({
                getRequest: () => ({
                    user: userRole ? { role: userRole } : null,
                }),
            }),
            getHandler: () => ({}),
            getClass: () => ({}),
        } as any;
    };

    it('should be defined', () => {
        expect(guard).toBeDefined();
    });

    it('should allow access if no roles are required', () => {
        jest.spyOn(reflector, 'getAllAndOverride').mockReturnValue(null);
        const context = createMockContext(UserRole.MEMBER);
        expect(guard.canActivate(context)).toBe(true);
    });

    it('should allow access for OWNER to any route', () => {
        jest
            .spyOn(reflector, 'getAllAndOverride')
            .mockReturnValue([UserRole.ADMIN]);
        const context = createMockContext(UserRole.OWNER);
        expect(guard.canActivate(context)).toBe(true);
    });

    it('should allow access if user has the required role', () => {
        jest
            .spyOn(reflector, 'getAllAndOverride')
            .mockReturnValue([UserRole.ADMIN]);
        const context = createMockContext(UserRole.ADMIN);
        expect(guard.canActivate(context)).toBe(true);
    });

    it('should deny access if user does not have the required role', () => {
        jest
            .spyOn(reflector, 'getAllAndOverride')
            .mockReturnValue([UserRole.ADMIN]);
        const context = createMockContext(UserRole.MEMBER);
        expect(guard.canActivate(context)).toBe(false);
    });

    it('should deny access if user is not authenticated', () => {
        jest
            .spyOn(reflector, 'getAllAndOverride')
            .mockReturnValue([UserRole.ADMIN]);
        const context = createMockContext(undefined);
        expect(guard.canActivate(context)).toBe(false);
    });

    it('should allow access for multiple roles', () => {
        jest
            .spyOn(reflector, 'getAllAndOverride')
            .mockReturnValue([UserRole.ADMIN, UserRole.STAFF]);

        expect(guard.canActivate(createMockContext(UserRole.ADMIN))).toBe(true);
        expect(guard.canActivate(createMockContext(UserRole.STAFF))).toBe(true);
        expect(guard.canActivate(createMockContext(UserRole.OWNER))).toBe(true);
        expect(guard.canActivate(createMockContext(UserRole.MEMBER))).toBe(false);
    });
});
