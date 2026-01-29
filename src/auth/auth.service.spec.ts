import { Test, TestingModule } from '@nestjs/testing';
import { JwtService } from '@nestjs/jwt';
import { ConflictException, UnauthorizedException } from '@nestjs/common';
import { AuthService } from './auth.service';
import { PrismaService } from '../prisma/prisma.service';
import { Role } from '@prisma/client';
import * as bcrypt from 'bcrypt';

describe('AuthService', () => {
  let service: AuthService;

  const mockPrismaService = {
    user: {
      findUnique: jest.fn(),
      create: jest.fn(),
    },
    member: {
      create: jest.fn(),
    },
    trainer: {
      create: jest.fn(),
    },
  };

  const mockJwtService = {
    sign: jest.fn(),
    verify: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        {
          provide: PrismaService,
          useValue: mockPrismaService,
        },
        {
          provide: JwtService,
          useValue: mockJwtService,
        },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
    prismaService = module.get<PrismaService>(PrismaService);
    jwtService = module.get<JwtService>(JwtService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('hashPassword', () => {
    it('should hash password with bcrypt using 10 salt rounds', async () => {
      const password = 'testPassword123';
      const hashedPassword = await service.hashPassword(password);

      expect(hashedPassword).toBeDefined();
      expect(hashedPassword).not.toBe(password);

      // Verify it's a valid bcrypt hash
      const isValid = await bcrypt.compare(password, hashedPassword);
      expect(isValid).toBe(true);
    });
  });

  describe('comparePasswords', () => {
    it('should return true for matching passwords', async () => {
      const password = 'testPassword123';
      const hashedPassword = await bcrypt.hash(password, 10);

      const result = await service.comparePasswords(password, hashedPassword);
      expect(result).toBe(true);
    });

    it('should return false for non-matching passwords', async () => {
      const password = 'testPassword123';
      const wrongPassword = 'wrongPassword456';
      const hashedPassword = await bcrypt.hash(password, 10);

      const result = await service.comparePasswords(
        wrongPassword,
        hashedPassword,
      );
      expect(result).toBe(false);
    });
  });

  describe('register', () => {
    it('should create a new user with hashed password and return token', async () => {
      const registerDto = {
        email: 'test@example.com',
        password: 'password123',
        firstName: 'John',
        lastName: 'Doe',
        role: Role.MEMBER,
      };

      const mockUser = {
        id: 'user-id',
        email: registerDto.email,
        password: 'hashed-password',
        role: Role.MEMBER,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      mockPrismaService.user.findUnique.mockResolvedValue(null);
      mockPrismaService.user.create.mockResolvedValue(mockUser);
      mockPrismaService.member.create.mockResolvedValue({});
      mockJwtService.sign.mockReturnValue('jwt-token');

      const result = await service.register(registerDto);

      expect(result).toHaveProperty('accessToken', 'jwt-token');
      expect(result).toHaveProperty('user');
      expect(result.user.email).toBe(registerDto.email);
      expect(result.user).not.toHaveProperty('password');
      expect(mockPrismaService.user.create).toHaveBeenCalled();
      expect(mockPrismaService.member.create).toHaveBeenCalled();
    });

    it('should throw ConflictException if user already exists', async () => {
      const registerDto = {
        email: 'existing@example.com',
        password: 'password123',
        firstName: 'John',
        lastName: 'Doe',
        role: Role.MEMBER,
      };

      mockPrismaService.user.findUnique.mockResolvedValue({
        id: 'existing-id',
        email: registerDto.email,
      });

      await expect(service.register(registerDto)).rejects.toThrow(
        ConflictException,
      );
    });

    it('should create trainer profile when role is TRAINER', async () => {
      const registerDto = {
        email: 'trainer@example.com',
        password: 'password123',
        firstName: 'Jane',
        lastName: 'Smith',
        role: Role.TRAINER,
      };

      const mockUser = {
        id: 'user-id',
        email: registerDto.email,
        password: 'hashed-password',
        role: Role.TRAINER,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      mockPrismaService.user.findUnique.mockResolvedValue(null);
      mockPrismaService.user.create.mockResolvedValue(mockUser);
      mockPrismaService.trainer.create.mockResolvedValue({});
      mockJwtService.sign.mockReturnValue('jwt-token');

      await service.register(registerDto);

      expect(mockPrismaService.trainer.create).toHaveBeenCalledWith({
        data: {
          userId: mockUser.id,
          firstName: registerDto.firstName,
          lastName: registerDto.lastName,
          specializations: [],
          certifications: [],
        },
      });
    });
  });

  describe('login', () => {
    it('should return token for valid credentials', async () => {
      const loginDto = {
        email: 'test@example.com',
        password: 'password123',
      };

      const hashedPassword = await bcrypt.hash(loginDto.password, 10);
      const mockUser = {
        id: 'user-id',
        email: loginDto.email,
        password: hashedPassword,
        role: Role.MEMBER,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      mockPrismaService.user.findUnique.mockResolvedValue(mockUser);
      mockJwtService.sign.mockReturnValue('jwt-token');

      const result = await service.login(loginDto);

      expect(result).toHaveProperty('accessToken', 'jwt-token');
      expect(result).toHaveProperty('user');
      expect(result.user.email).toBe(loginDto.email);
      expect(result.user).not.toHaveProperty('password');
    });

    it('should throw UnauthorizedException for non-existent user', async () => {
      const loginDto = {
        email: 'nonexistent@example.com',
        password: 'password123',
      };

      mockPrismaService.user.findUnique.mockResolvedValue(null);

      await expect(service.login(loginDto)).rejects.toThrow(
        UnauthorizedException,
      );
    });

    it('should throw UnauthorizedException for invalid password', async () => {
      const loginDto = {
        email: 'test@example.com',
        password: 'wrongpassword',
      };

      const hashedPassword = await bcrypt.hash('correctpassword', 10);
      const mockUser = {
        id: 'user-id',
        email: loginDto.email,
        password: hashedPassword,
        role: Role.MEMBER,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      mockPrismaService.user.findUnique.mockResolvedValue(mockUser);

      await expect(service.login(loginDto)).rejects.toThrow(
        UnauthorizedException,
      );
    });
  });

  describe('validateToken', () => {
    it('should return payload for valid token', async () => {
      const mockPayload = {
        sub: 'user-id',
        email: 'test@example.com',
        role: Role.MEMBER,
      };

      mockJwtService.verify.mockReturnValue(mockPayload);

      const result = await service.validateToken('valid-token');

      expect(result).toEqual(mockPayload);
    });

    it('should throw UnauthorizedException for invalid token', async () => {
      mockJwtService.verify.mockImplementation(() => {
        throw new Error('Invalid token');
      });

      await expect(service.validateToken('invalid-token')).rejects.toThrow(
        UnauthorizedException,
      );
    });
  });
});
