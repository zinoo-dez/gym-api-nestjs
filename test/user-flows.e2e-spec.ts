import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../src/app.module';
import { PrismaService } from '../src/prisma/prisma.service';

describe('User Flows (e2e)', () => {
  let app: INestApplication;
  let prisma: PrismaService;
  let authToken: string;
  let memberId: string;
  let classId: string;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
        forbidNonWhitelisted: true,
        transform: true,
      }),
    );

    await app.init();
    prisma = app.get<PrismaService>(PrismaService);

    // Clean up test data
    await prisma.attendance.deleteMany({
      where: { member: { user: { email: { contains: 'e2etest' } } } },
    });
    await prisma.classBooking.deleteMany({
      where: { member: { user: { email: { contains: 'e2etest' } } } },
    });
    await prisma.membership.deleteMany({
      where: { member: { user: { email: { contains: 'e2etest' } } } },
    });
    await prisma.member.deleteMany({
      where: { user: { email: { contains: 'e2etest' } } },
    });
    await prisma.user.deleteMany({
      where: { email: { contains: 'e2etest' } },
    });
  });

  afterAll(async () => {
    // Clean up test data
    await prisma.attendance.deleteMany({
      where: { member: { user: { email: { contains: 'e2etest' } } } },
    });
    await prisma.classBooking.deleteMany({
      where: { member: { user: { email: { contains: 'e2etest' } } } },
    });
    await prisma.membership.deleteMany({
      where: { member: { user: { email: { contains: 'e2etest' } } } },
    });
    await prisma.member.deleteMany({
      where: { user: { email: { contains: 'e2etest' } } },
    });
    await prisma.user.deleteMany({
      where: { email: { contains: 'e2etest' } },
    });

    await app.close();
  });

  describe('Complete Member Flow: Register → Book Class → Check-in', () => {
    it('should complete the full member journey', async () => {
      // Step 1: Register a new member
      const registerResponse = await request(app.getHttpServer())
        .post('/auth/register')
        .send({
          email: 'member.e2etest@example.com',
          password: 'SecurePass123!',
          firstName: 'Test',
          lastName: 'Member',
          role: 'MEMBER',
        })
        .expect(201);

      expect(registerResponse.body).toHaveProperty('accessToken');
      expect(registerResponse.body.user).toHaveProperty('id');
      expect(registerResponse.body.user.email).toBe(
        'member.e2etest@example.com',
      );

      authToken = registerResponse.body.accessToken;
      memberId = registerResponse.body.user.member.id;

      // Step 2: Get membership plans
      const plansResponse = await request(app.getHttpServer())
        .get('/membership-plans')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(plansResponse.body.data).toBeInstanceOf(Array);
      expect(plansResponse.body.data.length).toBeGreaterThan(0);

      const premiumPlan = plansResponse.body.data.find(
        (plan: any) => plan.type === 'PREMIUM',
      );
      expect(premiumPlan).toBeDefined();

      // Step 3: Assign membership to member (admin action - use existing member)
      // For this test, we'll use an existing active membership from seed data
      // In a real scenario, an admin would assign this

      // Step 4: Get available classes
      const classesResponse = await request(app.getHttpServer())
        .get('/classes')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(classesResponse.body.data).toBeInstanceOf(Array);
      expect(classesResponse.body.data.length).toBeGreaterThan(0);

      classId = classesResponse.body.data[0].id;

      // Step 5: Book a class
      const bookingResponse = await request(app.getHttpServer())
        .post(`/classes/${classId}/book`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          memberId: memberId,
        })
        .expect(201);

      expect(bookingResponse.body).toHaveProperty('id');
      expect(bookingResponse.body.status).toBe('CONFIRMED');
      expect(bookingResponse.body.classId).toBe(classId);

      // Step 6: Check member's bookings
      const memberBookingsResponse = await request(app.getHttpServer())
        .get(`/members/${memberId}/bookings`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(memberBookingsResponse.body).toBeInstanceOf(Array);
      expect(memberBookingsResponse.body.length).toBeGreaterThan(0);
      expect(
        memberBookingsResponse.body.some(
          (booking: any) => booking.classId === classId,
        ),
      ).toBe(true);

      // Step 7: Check-in for the class (requires active membership)
      // First, assign a membership
      const now = new Date();
      const endDate = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);

      await prisma.membership.create({
        data: {
          memberId: memberId,
          planId: premiumPlan.id,
          startDate: now,
          endDate: endDate,
          status: 'ACTIVE',
        },
      });

      const checkInResponse = await request(app.getHttpServer())
        .post('/attendance/check-in')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          memberId: memberId,
          type: 'CLASS_ATTENDANCE',
          classId: classId,
        })
        .expect(201);

      expect(checkInResponse.body).toHaveProperty('id');
      expect(checkInResponse.body.type).toBe('CLASS_ATTENDANCE');
      expect(checkInResponse.body.classId).toBe(classId);

      // Step 8: Verify attendance was recorded
      const attendanceResponse = await request(app.getHttpServer())
        .get('/attendance')
        .set('Authorization', `Bearer ${authToken}`)
        .query({ memberId: memberId })
        .expect(200);

      expect(attendanceResponse.body.data).toBeInstanceOf(Array);
      expect(attendanceResponse.body.data.length).toBeGreaterThan(0);
      expect(
        attendanceResponse.body.data.some(
          (record: any) =>
            record.memberId === memberId && record.classId === classId,
        ),
      ).toBe(true);
    });
  });
});
