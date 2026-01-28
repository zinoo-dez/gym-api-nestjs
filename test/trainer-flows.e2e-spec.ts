import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../src/app.module';
import { PrismaService } from '../src/prisma/prisma.service';

describe('Trainer Flows (e2e)', () => {
  let app: INestApplication;
  let prisma: PrismaService;
  let trainerToken: string;
  let trainerId: string;
  let classId: string;
  let testMemberId: string;

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

    // Login as trainer (from seed data)
    const loginResponse = await request(app.getHttpServer())
      .post('/auth/login')
      .send({
        email: 'sarah.johnson@gym.com',
        password: 'Password123!',
      })
      .expect(201);

    trainerToken = loginResponse.body.accessToken;
    trainerId = loginResponse.body.user.trainer.id;

    // Clean up test data
    await prisma.classBooking.deleteMany({
      where: { class: { name: { contains: 'E2E Test' } } },
    });
    await prisma.class.deleteMany({
      where: { name: { contains: 'E2E Test' } },
    });
  });

  afterAll(async () => {
    // Clean up test data
    await prisma.classBooking.deleteMany({
      where: { class: { name: { contains: 'E2E Test' } } },
    });
    await prisma.class.deleteMany({
      where: { name: { contains: 'E2E Test' } },
    });

    await app.close();
  });

  describe('Complete Trainer Flow: Create Class → View Bookings', () => {
    it('should complete the full trainer journey', async () => {
      // Step 1: Create a new class
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      tomorrow.setHours(10, 0, 0, 0);

      const createClassResponse = await request(app.getHttpServer())
        .post('/classes')
        .set('Authorization', `Bearer ${trainerToken}`)
        .send({
          name: 'E2E Test Yoga Class',
          description: 'Test yoga class for e2e testing',
          trainerId: trainerId,
          schedule: tomorrow.toISOString(),
          duration: 60,
          capacity: 15,
          classType: 'Yoga',
        })
        .expect(201);

      expect(createClassResponse.body).toHaveProperty('id');
      expect(createClassResponse.body.name).toBe('E2E Test Yoga Class');
      expect(createClassResponse.body.trainerId).toBe(trainerId);
      expect(createClassResponse.body.capacity).toBe(15);

      classId = createClassResponse.body.id;

      // Step 2: Verify class appears in schedule
      const classesListResponse = await request(app.getHttpServer())
        .get('/classes')
        .set('Authorization', `Bearer ${trainerToken}`)
        .expect(200);

      expect(classesListResponse.body.data).toBeInstanceOf(Array);
      const createdClass = classesListResponse.body.data.find(
        (cls: any) => cls.id === classId,
      );
      expect(createdClass).toBeDefined();
      expect(createdClass.name).toBe('E2E Test Yoga Class');

      // Step 3: Get class details
      const classDetailsResponse = await request(app.getHttpServer())
        .get(`/classes/${classId}`)
        .set('Authorization', `Bearer ${trainerToken}`)
        .expect(200);

      expect(classDetailsResponse.body.id).toBe(classId);
      expect(classDetailsResponse.body.trainer).toBeDefined();
      expect(classDetailsResponse.body.trainer.id).toBe(trainerId);

      // Step 4: Create a test member and book the class
      const registerResponse = await request(app.getHttpServer())
        .post('/auth/register')
        .send({
          email: 'trainermember.e2etest@example.com',
          password: 'SecurePass123!',
          firstName: 'Trainer',
          lastName: 'TestMember',
          role: 'MEMBER',
        })
        .expect(201);

      testMemberId = registerResponse.body.user.member.id;
      const memberToken = registerResponse.body.accessToken;

      // Assign membership to member
      const premiumPlan = await prisma.membershipPlan.findFirst({
        where: { type: 'PREMIUM' },
      });

      const now = new Date();
      const endDate = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);

      await prisma.membership.create({
        data: {
          memberId: testMemberId,
          planId: premiumPlan!.id,
          startDate: now,
          endDate: endDate,
          status: 'ACTIVE',
        },
      });

      // Book the class
      const bookingResponse = await request(app.getHttpServer())
        .post(`/classes/${classId}/book`)
        .set('Authorization', `Bearer ${memberToken}`)
        .send({
          memberId: testMemberId,
        })
        .expect(201);

      expect(bookingResponse.body).toHaveProperty('id');
      expect(bookingResponse.body.status).toBe('CONFIRMED');

      // Step 5: Trainer views class bookings
      const classWithBookingsResponse = await request(app.getHttpServer())
        .get(`/classes/${classId}`)
        .set('Authorization', `Bearer ${trainerToken}`)
        .expect(200);

      expect(classWithBookingsResponse.body.bookings).toBeInstanceOf(Array);
      expect(classWithBookingsResponse.body.bookings.length).toBeGreaterThan(0);
      expect(
        classWithBookingsResponse.body.bookings.some(
          (booking: any) => booking.memberId === testMemberId,
        ),
      ).toBe(true);

      // Step 6: Update class details
      const updateClassResponse = await request(app.getHttpServer())
        .patch(`/classes/${classId}`)
        .set('Authorization', `Bearer ${trainerToken}`)
        .send({
          description: 'Updated yoga class description',
          capacity: 20,
        })
        .expect(200);

      expect(updateClassResponse.body.description).toBe(
        'Updated yoga class description',
      );
      expect(updateClassResponse.body.capacity).toBe(20);

      // Step 7: Get trainer's schedule
      const trainerScheduleResponse = await request(app.getHttpServer())
        .get(`/trainers/${trainerId}`)
        .set('Authorization', `Bearer ${trainerToken}`)
        .expect(200);

      expect(trainerScheduleResponse.body.id).toBe(trainerId);
      expect(trainerScheduleResponse.body.classes).toBeInstanceOf(Array);
      expect(
        trainerScheduleResponse.body.classes.some(
          (cls: any) => cls.id === classId,
        ),
      ).toBe(true);
    });

    it('should prevent scheduling conflicts', async () => {
      // Create a class at a specific time
      const specificTime = new Date();
      specificTime.setDate(specificTime.getDate() + 2);
      specificTime.setHours(14, 0, 0, 0);

      const firstClassResponse = await request(app.getHttpServer())
        .post('/classes')
        .set('Authorization', `Bearer ${trainerToken}`)
        .send({
          name: 'E2E Test First Class',
          description: 'First class for conflict testing',
          trainerId: trainerId,
          schedule: specificTime.toISOString(),
          duration: 60,
          capacity: 10,
          classType: 'Strength',
        })
        .expect(201);

      expect(firstClassResponse.body).toHaveProperty('id');

      // Try to create an overlapping class (should fail)
      const overlappingTime = new Date(specificTime);
      overlappingTime.setMinutes(30); // 30 minutes into the first class

      const conflictResponse = await request(app.getHttpServer())
        .post('/classes')
        .set('Authorization', `Bearer ${trainerToken}`)
        .send({
          name: 'E2E Test Conflicting Class',
          description: 'This should fail due to conflict',
          trainerId: trainerId,
          schedule: overlappingTime.toISOString(),
          duration: 60,
          capacity: 10,
          classType: 'Cardio',
        })
        .expect(409);

      expect(conflictResponse.body.message).toContain('conflict');
    });

    it('should handle class capacity limits', async () => {
      // Create a class with capacity of 1
      const futureTime = new Date();
      futureTime.setDate(futureTime.getDate() + 3);
      futureTime.setHours(16, 0, 0, 0);

      const limitedClassResponse = await request(app.getHttpServer())
        .post('/classes')
        .set('Authorization', `Bearer ${trainerToken}`)
        .send({
          name: 'E2E Test Limited Capacity Class',
          description: 'Class with capacity of 1',
          trainerId: trainerId,
          schedule: futureTime.toISOString(),
          duration: 45,
          capacity: 1,
          classType: 'Personal Training',
        })
        .expect(201);

      const limitedClassId = limitedClassResponse.body.id;

      // Create first member and book
      const member1Response = await request(app.getHttpServer())
        .post('/auth/register')
        .send({
          email: 'capacity1.e2etest@example.com',
          password: 'SecurePass123!',
          firstName: 'Capacity',
          lastName: 'Test1',
          role: 'MEMBER',
        })
        .expect(201);

      const member1Id = member1Response.body.user.member.id;
      const member1Token = member1Response.body.accessToken;

      // Assign membership
      const premiumPlan = await prisma.membershipPlan.findFirst({
        where: { type: 'PREMIUM' },
      });

      const now = new Date();
      const endDate = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);

      await prisma.membership.create({
        data: {
          memberId: member1Id,
          planId: premiumPlan!.id,
          startDate: now,
          endDate: endDate,
          status: 'ACTIVE',
        },
      });

      // First booking should succeed
      await request(app.getHttpServer())
        .post(`/classes/${limitedClassId}/book`)
        .set('Authorization', `Bearer ${member1Token}`)
        .send({
          memberId: member1Id,
        })
        .expect(201);

      // Create second member
      const member2Response = await request(app.getHttpServer())
        .post('/auth/register')
        .send({
          email: 'capacity2.e2etest@example.com',
          password: 'SecurePass123!',
          firstName: 'Capacity',
          lastName: 'Test2',
          role: 'MEMBER',
        })
        .expect(201);

      const member2Id = member2Response.body.user.member.id;
      const member2Token = member2Response.body.accessToken;

      await prisma.membership.create({
        data: {
          memberId: member2Id,
          planId: premiumPlan!.id,
          startDate: now,
          endDate: endDate,
          status: 'ACTIVE',
        },
      });

      // Second booking should fail (capacity reached)
      const capacityResponse = await request(app.getHttpServer())
        .post(`/classes/${limitedClassId}/book`)
        .set('Authorization', `Bearer ${member2Token}`)
        .send({
          memberId: member2Id,
        })
        .expect(400);

      expect(capacityResponse.body.message).toContain('capacity');
    });
  });
});
