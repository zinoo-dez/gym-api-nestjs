import 'dotenv/config';
import { PrismaClient } from '@prisma/client';
import { Pool } from 'pg';
import { PrismaPg } from '@prisma/adapter-pg';
import * as bcrypt from 'bcrypt';
import { randomUUID } from 'node:crypto';

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function main() {
  console.log('🌱 Starting database seeding...');

  // Clear existing data
  console.log('🧹 Cleaning existing data...');
  await prisma.attendance.deleteMany();
  await prisma.userProgress.deleteMany();
  await prisma.trainerSession.deleteMany();
  await prisma.workoutPlan.deleteMany();
  await prisma.classBooking.deleteMany();
  await prisma.classSchedule.deleteMany();
  await prisma.class.deleteMany();
  await prisma.subscription.deleteMany();
  await prisma.membershipPlan.deleteMany();
  await prisma.member.deleteMany();
  await prisma.trainer.deleteMany();
  await prisma.user.deleteMany();
  await prisma.equipment.deleteMany();
  await prisma.membership_plan_features.deleteMany();
  await prisma.features.deleteMany();
  console.log('✓ Cleaned\n');

  // Hash password
  const hashedPassword = await bcrypt.hash('Password123!', 10);

  // Create Admin User
  console.log('👤 Creating admin user...');
  await prisma.user.create({
    data: {
      email: 'admin@gym.com',
      password: hashedPassword,
      firstName: 'Admin',
      lastName: 'User',
      role: 'ADMIN',
    },
  });
  console.log('✓ Admin created\n');

  // Create System Features
  console.log('✨ Creating system features...');
  const systemFeatures = [
    {
      name: 'Full equipment access',
      description: 'Access to all gym equipment',
      is_system: true,
      default_name: 'Full equipment access',
    },
    {
      name: 'Unlimited group classes',
      description: 'Access to all group fitness classes',
      is_system: true,
      default_name: 'Unlimited group classes',
    },
    {
      name: '4 personal training hours',
      description: 'Monthly personal training sessions',
      is_system: true,
      default_name: '4 personal training hours',
    },
    {
      name: 'Locker access',
      description: 'Private locker for your belongings',
      is_system: true,
      default_name: 'Locker access',
    },
    {
      name: 'Nutrition consultation',
      description: 'Monthly session with a nutritionist',
      is_system: true,
      default_name: 'Nutrition consultation',
    },
  ];

  const createdFeatures: any = {};
  for (const feature of systemFeatures) {
    const created = await prisma.features.create({
      data: {
        ...feature,
        id: randomUUID(),
        updated_at: new Date(),
      },
    });
    createdFeatures[feature.name] = created.id;
  }
  console.log('✓ 5 system features created\n');

  // Create Membership Plans
  console.log('💳 Creating membership plans...');
  const basicPlan = await prisma.membershipPlan.create({
    data: {
      name: 'Basic',
      description: 'Perfect for beginners',
      price: 29.99,
      duration: 30,
      unlimitedClasses: false,
      personalTrainingHours: 0,
      accessToEquipment: true,
      accessToLocker: false,
      nutritionConsultation: false,
      membership_plan_features: {
        create: [
          {
            id: randomUUID(),
            feature_id: createdFeatures['Full equipment access'],
            level: 'BASIC',
            updated_at: new Date(),
          },
        ],
      },
    },
  });

  const premiumPlan = await prisma.membershipPlan.create({
    data: {
      name: 'Premium',
      description: 'Most popular choice',
      price: 49.99,
      duration: 30,
      unlimitedClasses: true,
      personalTrainingHours: 2,
      accessToEquipment: true,
      accessToLocker: true,
      nutritionConsultation: false,
      membership_plan_features: {
        create: [
          {
            id: randomUUID(),
            feature_id: createdFeatures['Full equipment access'],
            level: 'STANDARD',
            updated_at: new Date(),
          },
          {
            id: randomUUID(),
            feature_id: createdFeatures['Unlimited group classes'],
            level: 'BASIC',
            updated_at: new Date(),
          },
          {
            id: randomUUID(),
            feature_id: createdFeatures['Locker access'],
            level: 'BASIC',
            updated_at: new Date(),
          },
        ],
      },
    },
  });

  await prisma.membershipPlan.create({
    data: {
      name: 'Elite',
      description: 'Complete fitness package',
      price: 79.99,
      duration: 30,
      unlimitedClasses: true,
      personalTrainingHours: 4,
      accessToEquipment: true,
      accessToLocker: true,
      nutritionConsultation: true,
      membership_plan_features: {
        create: [
          {
            id: randomUUID(),
            feature_id: createdFeatures['Full equipment access'],
            level: 'PREMIUM',
            updated_at: new Date(),
          },
          {
            id: randomUUID(),
            feature_id: createdFeatures['Unlimited group classes'],
            level: 'PREMIUM',
            updated_at: new Date(),
          },
          {
            id: randomUUID(),
            feature_id: createdFeatures['4 personal training hours'],
            level: 'BASIC',
            updated_at: new Date(),
          },
          {
            id: randomUUID(),
            feature_id: createdFeatures['Locker access'],
            level: 'STANDARD',
            updated_at: new Date(),
          },
          {
            id: randomUUID(),
            feature_id: createdFeatures['Nutrition consultation'],
            level: 'BASIC',
            updated_at: new Date(),
          },
        ],
      },
    },
  });
  console.log('✓ 3 membership plans created\n');

  // Create Trainers
  console.log('🏋️ Creating trainers...');
  const trainer1 = await prisma.user.create({
    data: {
      email: 'john.trainer@gym.com',
      password: hashedPassword,
      firstName: 'John',
      lastName: 'Smith',
      role: 'TRAINER',
      trainer: {
        create: {
          specialization: 'Strength Training',
          certification: 'NASM-CPT, CSCS',
          experience: 5,
          bio: 'Specialized in strength training and bodybuilding',
          hourlyRate: 50.0,
        },
      },
    },
    include: { trainer: true },
  });

  const trainer2 = await prisma.user.create({
    data: {
      email: 'sarah.trainer@gym.com',
      password: hashedPassword,
      firstName: 'Sarah',
      lastName: 'Johnson',
      role: 'TRAINER',
      trainer: {
        create: {
          specialization: 'Yoga',
          certification: 'RYT-500, PMA-CPT',
          experience: 8,
          bio: 'Yoga and Pilates expert',
          hourlyRate: 45.0,
        },
      },
    },
    include: { trainer: true },
  });

  const trainer3 = await prisma.user.create({
    data: {
      email: 'mike.trainer@gym.com',
      password: hashedPassword,
      firstName: 'Mike',
      lastName: 'Davis',
      role: 'TRAINER',
      trainer: {
        create: {
          specialization: 'CrossFit',
          certification: 'CF-L2, NASM-CPT',
          experience: 6,
          bio: 'CrossFit and HIIT specialist',
          hourlyRate: 55.0,
        },
      },
    },
    include: { trainer: true },
  });
  console.log('✓ 3 trainers created\n');

  // Create Members
  console.log('👥 Creating members...');
  const member1 = await prisma.user.create({
    data: {
      email: 'alice.member@gym.com',
      password: hashedPassword,
      firstName: 'Alice',
      lastName: 'Williams',
      phone: '+1234567890',
      role: 'MEMBER',
      member: {
        create: {
          dateOfBirth: new Date('1990-05-15'),
          gender: 'Female',
          currentWeight: 65.0,
          targetWeight: 60.0,
          height: 165.0,
        },
      },
    },
    include: { member: true },
  });

  const member2 = await prisma.user.create({
    data: {
      email: 'bob.member@gym.com',
      password: hashedPassword,
      firstName: 'Bob',
      lastName: 'Brown',
      phone: '+1234567891',
      role: 'MEMBER',
      member: {
        create: {
          dateOfBirth: new Date('1985-08-22'),
          gender: 'Male',
          currentWeight: 80.0,
          targetWeight: 75.0,
          height: 180.0,
        },
      },
    },
    include: { member: true },
  });
  console.log('✓ 2 members created\n');

  // Create Subscriptions
  console.log('📝 Creating subscriptions...');
  const now = new Date();
  await prisma.subscription.create({
    data: {
      memberId: member1.member!.id,
      membershipPlanId: premiumPlan.id,
      startDate: now,
      endDate: new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000),
      status: 'ACTIVE',
      autoRenew: true,
    },
  });

  await prisma.subscription.create({
    data: {
      memberId: member2.member!.id,
      membershipPlanId: basicPlan.id,
      startDate: now,
      endDate: new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000),
      status: 'ACTIVE',
      autoRenew: true,
    },
  });
  console.log('✓ 2 subscriptions created\n');

  // Create Classes
  console.log('🏃 Creating classes...');
  const yogaClass = await prisma.class.create({
    data: {
      name: 'Morning Yoga Flow',
      description: 'A relaxing yoga session to start your day',
      category: 'Yoga',
      level: 'ALL_LEVELS',
      duration: 60,
      maxCapacity: 20,
    },
  });

  const hiitClass = await prisma.class.create({
    data: {
      name: 'HIIT Blast',
      description: 'High intensity interval training',
      category: 'HIIT',
      level: 'INTERMEDIATE',
      duration: 45,
      maxCapacity: 15,
    },
  });

  const strengthClass = await prisma.class.create({
    data: {
      name: 'Strength Training 101',
      description: 'Learn the basics of strength training',
      category: 'Strength',
      level: 'BEGINNER',
      duration: 60,
      maxCapacity: 12,
    },
  });
  console.log('✓ 3 classes created\n');

  // Create Class Schedules
  console.log('� Creating class schedules...');
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  tomorrow.setHours(8, 0, 0, 0);

  const yogaSchedule = await prisma.classSchedule.create({
    data: {
      classId: yogaClass.id,
      trainerId: trainer2.trainer!.id,
      startTime: tomorrow,
      endTime: new Date(tomorrow.getTime() + 60 * 60 * 1000),
      daysOfWeek: JSON.stringify(['Monday', 'Wednesday', 'Friday']),
      isActive: true,
    },
  });

  await prisma.classSchedule.create({
    data: {
      classId: hiitClass.id,
      trainerId: trainer3.trainer!.id,
      startTime: new Date(tomorrow.getTime() + 2 * 60 * 60 * 1000),
      endTime: new Date(tomorrow.getTime() + 2.75 * 60 * 60 * 1000),
      daysOfWeek: JSON.stringify(['Tuesday', 'Thursday']),
      isActive: true,
    },
  });

  const strengthSchedule = await prisma.classSchedule.create({
    data: {
      classId: strengthClass.id,
      trainerId: trainer1.trainer!.id,
      startTime: new Date(tomorrow.getTime() + 4 * 60 * 60 * 1000),
      endTime: new Date(tomorrow.getTime() + 5 * 60 * 60 * 1000),
      daysOfWeek: JSON.stringify(['Monday', 'Wednesday', 'Friday']),
      isActive: true,
    },
  });
  console.log('✓ 3 class schedules created\n');

  // Create Class Bookings
  console.log('� Creat.ing class bookings...');
  await prisma.classBooking.create({
    data: {
      memberId: member1.member!.id,
      classScheduleId: yogaSchedule.id,
      status: 'CONFIRMED',
    },
  });

  await prisma.classBooking.create({
    data: {
      memberId: member2.member!.id,
      classScheduleId: strengthSchedule.id,
      status: 'CONFIRMED',
    },
  });
  console.log('✓ 2 class bookings created\n');

  // Create Workout Plans
  console.log('💪 Creating workout plans...');
  await prisma.workoutPlan.create({
    data: {
      memberId: member1.member!.id,
      trainerId: trainer1.trainer!.id,
      name: 'Weight Loss Program',
      description: 'Customized weight loss workout plan',
      goal: 'Weight Loss',
      startDate: now,
      endDate: new Date(now.getTime() + 90 * 24 * 60 * 60 * 1000),
      isActive: true,
      exercises: JSON.stringify([
        {
          name: 'Squats',
          sets: 3,
          reps: 12,
          description: 'Bodyweight squats',
        },
        {
          name: 'Push-ups',
          sets: 3,
          reps: 10,
          description: 'Standard push-ups',
        },
      ]),
    },
  });
  console.log('✓ 1 workout plan created\n');

  // Create Equipment
  console.log('🏋️ Creating equipment...');
  await prisma.equipment.createMany({
    data: [
      {
        name: 'Treadmill',
        category: 'Cardio',
        description: 'Commercial grade treadmill',
        quantity: 10,
        isActive: true,
      },
      {
        name: 'Bench Press',
        category: 'Strength',
        description: 'Olympic bench press station',
        quantity: 5,
        isActive: true,
      },
      {
        name: 'Yoga Mat',
        category: 'Functional',
        description: 'Premium yoga mat',
        quantity: 30,
        isActive: true,
      },
    ],
  });
  console.log('✓ 3 equipment items created\n');

  // Final Summary
  const finalCounts = {
    users: await prisma.user.count(),
    trainers: await prisma.trainer.count(),
    members: await prisma.member.count(),
    membershipPlans: await prisma.membershipPlan.count(),
    subscriptions: await prisma.subscription.count(),
    classes: await prisma.class.count(),
    classSchedules: await prisma.classSchedule.count(),
    classBookings: await prisma.classBooking.count(),
    workoutPlans: await prisma.workoutPlan.count(),
    equipment: await prisma.equipment.count(),
  };

  console.log('✅ Database seeding completed successfully!\n');
  console.log('📊 Final Summary:');
  console.log(`- Total Users: ${finalCounts.users}`);
  console.log(`- Trainers: ${finalCounts.trainers}`);
  console.log(`- Members: ${finalCounts.members}`);
  console.log(`- Membership Plans: ${finalCounts.membershipPlans}`);
  console.log(`- Active Subscriptions: ${finalCounts.subscriptions}`);
  console.log(`- Classes: ${finalCounts.classes}`);
  console.log(`- Class Schedules: ${finalCounts.classSchedules}`);
  console.log(`- Class Bookings: ${finalCounts.classBookings}`);
  console.log(`- Workout Plans: ${finalCounts.workoutPlans}`);
  console.log(`- Equipment: ${finalCounts.equipment}`);
  console.log('\n🔑 Login credentials:');
  console.log('- Admin: admin@gym.com / Password123!');
  console.log('- Trainer: john.trainer@gym.com / Password123!');
  console.log('- Member: alice.member@gym.com / Password123!');
}

main()
  .catch((e) => {
    console.error('❌ Error seeding database:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
    await pool.end();
  });
