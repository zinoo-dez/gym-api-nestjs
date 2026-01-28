import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../src/app.module';
import { PrismaService } from '../src/prisma/prisma.service';

describe('Admin Flows (e2e)', () => {
  let app: INestApplication;
  let prisma: PrismaService;
  let adminToken: string;
  let membershipPlanId: string;
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

    // Login as admin (from seed data)
    const loginResponse = await request(app.getHttpServer())
      .post('/auth/login')
      .send({
        email: 'admin@gym.com',
        password: 'Password123!',
      })
      .expect(201);

    adminToken = loginResponse.body.accessToken;

    // Clean up test data
    await prisma.membership.deleteMany({
      where: {
        plan: { name: { contains: 'E2E Test' } },
      },
    });
    await prisma.membershipPlan.deleteMany({
      where: { name: { contains: 'E2E Test' } },
    });
    await prisma.member.deleteMany({
      where: { user: { email: { contains: 'admin.e2etest' } } },
    });
    await prisma.user.deleteMany({
      where: { email: { contains: 'admin.e2etest' } },
    });
  });

  afterAll(async () => {
    // Clean up test data
    await prisma.membership.deleteMany({
      where: {
        plan: { name: { contains: 'E2E Test' } },
      },
    });
    await prisma.membershipPlan.deleteMany({
      where: { name: { contains: 'E2E Test' } },
    });
    await prisma.member.deleteMany({
      where: { user: { email: { contains: 'admin.e2etest' } } },
    });
    await prisma.user.deleteMany({
      where: { email: { contains: 'admin.e2etest' } },
    });

    await app.close();
  });

  describe('Complete Admin Flow: Create Plan → Assign Membership', () => {
    it('should complete the full admin journey', async () => {
      // Step 1: Create a new membership plan
      const createPlanResponse = await request(app.getHttpServer())
        .post('/membership-plans')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          name: 'E2E Test Premium Plan',
          description: 'Test plan for e2e testing',
          durationDays: 30,
          price: 99.99,
          type: 'PREMIUM',
          features: [
            'Gym access',
            'Group classes',
            'Personal training',
            'Nutrition consultation',
          ],
        })
        .expect(201);

      expect(createPlanResponse.body).toHaveProperty('id');
      expect(createPlanResponse.body.name).toBe('E2E Test Premium Plan');
      expect(createPlanResponse.body.type).toBe('PREMIUM');
      expect(createPlanResponse.body.price).toBe('99.99');

      membershipPlanId = createPlanResponse.body.id;

      // Step 2: Verify plan appears in list
      const plansListResponse = await request(app.getHttpServer())
        .get('/membership-plans')
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);

      expect(plansListResponse.body.data).toBeInstanceOf(Array);
      const createdPlan = plansListResponse.body.data.find(
        (plan: any) => plan.id === membershipPlanId,
      );
      expect(createdPlan).toBeDefined();
      expect(createdPlan.name).toBe('E2E Test Premium Plan');

      // Step 3: Create a test member
      const registerResponse = await request(app.getHttpServer())
        .post('/auth/register')
        .send({
          email: 'testmember.admin.e2etest@example.com',
          password: 'SecurePass123!',
          firstName: 'Test',
          lastName: 'AdminMember',
          role: 'MEMBER',
        })
        .expect(201);

      testMemberId = registerResponse.body.user.member.id;

      // Step 4: Assign membership to member
      const now = new Date();
      const assignMembershipResponse = await request(app.getHttpServer())
        .post('/memberships')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          memberId: testMemberId,
          planId: membershipPlanId,
          startDate: now.toISOString(),
        })
        .expect(201);

      expect(assignMembershipResponse.body).toHaveProperty('id');
      expect(assignMembershipResponse.body.memberId).toBe(testMemberId);
      expect(assignMembershipResponse.body.planId).toBe(membershipPlanId);
      expect(assignMembershipResponse.body.status).toBe('ACTIVE');

      // Step 5: Verify membership is active
      const membershipResponse = await request(app.getHttpServer())
        .get(`/memberships/${assignMembershipResponse.body.id}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);

      expect(membershipResponse.body.id).toBe(assignMembershipResponse.body.id);
      expect(membershipResponse.body.status).toBe('ACTIVE');
      expect(membershipResponse.body.plan.name).toBe('E2E Test Premium Plan');

      // Step 6: Get member details to verify membership
      const memberResponse = await request(app.getHttpServer())
        .get(`/members/${testMemberId}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);

      expect(memberResponse.body.id).toBe(testMemberId);
      expect(memberResponse.body.isActive).toBe(true);

      // Step 7: Update membership plan
      const updatePlanResponse = await request(app.getHttpServer())
        .patch(`/membership-plans/${membershipPlanId}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          price: 89.99,
          description: 'Updated test plan description',
        })
        .expect(200);

      expect(updatePlanResponse.body.price).toBe('89.99');
      expect(updatePlanResponse.body.description).toBe(
        'Updated test plan description',
      );

      // Step 8: Verify updated plan
      const updatedPlanResponse = await request(app.getHttpServer())
        .get(`/membership-plans/${membershipPlanId}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);

      expect(updatedPlanResponse.body.price).toBe('89.99');
      expect(updatedPlanResponse.body.description).toBe(
        'Updated test plan description',
      );
    });

    it('should handle membership upgrades', async () => {
      // Create a basic plan
      const basicPlanResponse = await request(app.getHttpServer())
        .post('/membership-plans')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          name: 'E2E Test Basic Plan',
          description: 'Basic plan for upgrade testing',
          durationDays: 30,
          price: 49.99,
          type: 'BASIC',
          features: ['Gym access'],
        })
        .expect(201);

      const basicPlanId = basicPlanResponse.body.id;

      // Create a VIP plan
      const vipPlanResponse = await request(app.getHttpServer())
        .post('/membership-plans')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          name: 'E2E Test VIP Plan',
          description: 'VIP plan for upgrade testing',
          durationDays: 30,
          price: 149.99,
          type: 'VIP',
          features: [
            'Gym access',
            'Group classes',
            'Personal training',
            'Nutrition consultation',
            'Spa access',
          ],
        })
        .expect(201);

      const vipPlanId = vipPlanResponse.body.id;

      // Create a test member
      const registerResponse = await request(app.getHttpServer())
        .post('/auth/register')
        .send({
          email: 'upgrade.admin.e2etest@example.com',
          password: 'SecurePass123!',
          firstName: 'Upgrade',
          lastName: 'Test',
          role: 'MEMBER',
        })
        .expect(201);

      const upgradeMemberId = registerResponse.body.user.member.id;

      // Assign basic membership
      const now = new Date();
      const basicMembershipResponse = await request(app.getHttpServer())
        .post('/memberships')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          memberId: upgradeMemberId,
          planId: basicPlanId,
          startDate: now.toISOString(),
        })
        .expect(201);

      expect(basicMembershipResponse.body.status).toBe('ACTIVE');

      // Upgrade to VIP
      const upgradeResponse = await request(app.getHttpServer())
        .post(`/memberships/${basicMembershipResponse.body.id}/upgrade`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          newPlanId: vipPlanId,
        })
        .expect(201);

      expect(upgradeResponse.body.planId).toBe(vipPlanId);
      expect(upgradeResponse.body.status).toBe('ACTIVE');

      // Verify old membership is cancelled
      const oldMembershipResponse = await request(app.getHttpServer())
        .get(`/memberships/${basicMembershipResponse.body.id}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);

      expect(oldMembershipResponse.body.status).toBe('CANCELLED');
    });
  });
});
