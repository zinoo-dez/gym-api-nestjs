import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../src/app.module';
import { PrismaService } from '../src/prisma/prisma.service';
import { GlobalExceptionFilter } from '../src/common/filters';
import { ResponseInterceptor } from '../src/common/interceptors';

describe('Input Sanitization (e2e)', () => {
  let app: INestApplication;
  let prisma: PrismaService;
  let authToken: string;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();

    // Apply the same configuration as main.ts
    app.useGlobalFilters(new GlobalExceptionFilter());
    app.useGlobalInterceptors(new ResponseInterceptor());
    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
        forbidNonWhitelisted: true,
        transform: true,
        transformOptions: {
          enableImplicitConversion: true,
        },
      }),
    );

    await app.init();

    prisma = app.get<PrismaService>(PrismaService);

    // Clean up database
    await prisma.attendance.deleteMany();
    await prisma.exercise.deleteMany();
    await prisma.workoutPlan.deleteMany();
    await prisma.classBooking.deleteMany();
    await prisma.class.deleteMany();
    await prisma.membership.deleteMany();
    await prisma.membershipPlan.deleteMany();
    await prisma.member.deleteMany();
    await prisma.trainer.deleteMany();
    await prisma.user.deleteMany();

    // Create admin user and get token
    const registerResponse = await request(app.getHttpServer())
      .post('/auth/register')
      .send({
        email: 'admin@test.com',
        password: 'AdminPass123!',
        firstName: 'Admin',
        lastName: 'User',
        role: 'ADMIN',
      });

    authToken = registerResponse.body.accessToken;
  });

  afterAll(async () => {
    await prisma.$disconnect();
    await app.close();
  });

  describe('XSS Attack Prevention', () => {
    it('should sanitize script tags in member registration', async () => {
      const response = await request(app.getHttpServer())
        .post('/members')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          email: 'xss-test@example.com',
          password: 'SecurePass123!',
          firstName: '<script>alert("XSS")</script>John',
          lastName: 'Doe<img src=x onerror=alert(1)>',
          phone: '+1234567890',
        })
        .expect(201);

      // Verify the response doesn't contain executable scripts
      expect(response.body.firstName).not.toContain('<script>');
      expect(response.body.firstName).not.toContain('</script>');
      expect(response.body.lastName).not.toContain('<img');
      expect(response.body.lastName).not.toContain('onerror');

      // Verify data in database is also sanitized
      const member = await prisma.member.findFirst({
        where: { id: response.body.id },
      });

      expect(member?.firstName).not.toContain('<script>');
      expect(member?.lastName).not.toContain('<img');
    });

    it('should sanitize HTML in trainer specializations', async () => {
      const response = await request(app.getHttpServer())
        .post('/trainers')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          email: 'trainer-xss@example.com',
          password: 'TrainerPass123!',
          firstName: 'Jane',
          lastName: 'Trainer',
          specializations: [
            'Yoga<script>alert(1)</script>',
            '<b>Pilates</b>',
            'Cardio',
          ],
          certifications: ['Cert1<img src=x>'],
        })
        .expect(201);

      // Verify specializations are sanitized
      expect(response.body.specializations[0]).not.toContain('<script>');
      expect(response.body.specializations[1]).not.toContain('<b>');
      expect(response.body.certifications[0]).not.toContain('<img');
    });

    it('should sanitize class descriptions', async () => {
      // First create a trainer
      const trainerResponse = await request(app.getHttpServer())
        .post('/trainers')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          email: 'trainer-class@example.com',
          password: 'TrainerPass123!',
          firstName: 'John',
          lastName: 'Trainer',
          specializations: ['Yoga'],
          certifications: ['Cert1'],
        });

      const trainerId = trainerResponse.body.id;

      const response = await request(app.getHttpServer())
        .post('/classes')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          name: 'Morning Yoga<script>alert(1)</script>',
          description: '<img src=x onerror=alert(1)>Relaxing morning session',
          trainerId: trainerId,
          schedule: new Date(Date.now() + 86400000).toISOString(),
          duration: 60,
          capacity: 20,
          classType: 'Yoga',
        })
        .expect(201);

      expect(response.body.name).not.toContain('<script>');
      expect(response.body.description).not.toContain('<img');
      expect(response.body.description).not.toContain('onerror');
    });
  });

  describe('SQL Injection Prevention', () => {
    it('should handle SQL injection attempts in search queries', async () => {
      // Create a member first
      await request(app.getHttpServer())
        .post('/members')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          email: 'sql-test@example.com',
          password: 'SecurePass123!',
          firstName: 'SQL',
          lastName: 'Test',
        });

      // Try SQL injection in search
      const response = await request(app.getHttpServer())
        .get('/members')
        .set('Authorization', `Bearer ${authToken}`)
        .query({
          name: "' OR '1'='1",
          email: "admin'--",
        })
        .expect(200);

      // Should return empty or sanitized results, not all members
      // The query should be safely escaped
      expect(response.body).toBeDefined();
    });

    it('should sanitize potential SQL injection in member updates', async () => {
      // Create a member
      const createResponse = await request(app.getHttpServer())
        .post('/members')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          email: 'update-sql@example.com',
          password: 'SecurePass123!',
          firstName: 'Update',
          lastName: 'Test',
        });

      const memberId = createResponse.body.id;

      // Try to update with SQL injection
      const response = await request(app.getHttpServer())
        .patch(`/members/${memberId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          firstName: "'; DROP TABLE members; --",
          lastName: "' OR '1'='1",
        })
        .expect(200);

      // Verify the data is sanitized
      expect(response.body.firstName).not.toBe("'; DROP TABLE members; --");
      expect(response.body.lastName).not.toBe("' OR '1'='1");

      // Verify the table still exists by querying
      const members = await prisma.member.findMany();
      expect(members).toBeDefined();
    });
  });

  describe('Control Character Prevention', () => {
    it('should remove null bytes from input', async () => {
      const response = await request(app.getHttpServer())
        .post('/members')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          email: 'nullbyte@example.com',
          password: 'SecurePass123!',
          firstName: 'John\x00Null',
          lastName: 'Doe',
        })
        .expect(201);

      expect(response.body.firstName).not.toContain('\x00');
      expect(response.body.firstName).toBe('JohnNull');
    });

    it('should remove control characters', async () => {
      const response = await request(app.getHttpServer())
        .post('/members')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          email: 'control@example.com',
          password: 'SecurePass123!',
          firstName: 'John\x01\x02\x03',
          lastName: 'Doe',
        })
        .expect(201);

      expect(response.body.firstName).toBe('John');
    });
  });

  describe('Whitespace Handling', () => {
    it('should trim excessive whitespace', async () => {
      const response = await request(app.getHttpServer())
        .post('/members')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          email: 'whitespace@example.com',
          password: 'SecurePass123!',
          firstName: '   John   ',
          lastName: '\t\tDoe\n\n',
        })
        .expect(201);

      expect(response.body.firstName).toBe('John');
      expect(response.body.lastName).toBe('Doe');
    });
  });

  describe('Data Type Preservation', () => {
    it('should preserve numeric values', async () => {
      // Create membership plan with numeric values
      const response = await request(app.getHttpServer())
        .post('/membership-plans')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          name: 'Test Plan',
          description: 'Test description',
          durationDays: 30,
          price: 99.99,
          type: 'BASIC',
          features: ['Feature 1', 'Feature 2'],
        })
        .expect(201);

      expect(typeof response.body.durationDays).toBe('number');
      expect(response.body.durationDays).toBe(30);
      expect(typeof response.body.price).toBe('string'); // Prisma returns Decimal as string
      expect(parseFloat(response.body.price)).toBe(99.99);
    });
  });
});
