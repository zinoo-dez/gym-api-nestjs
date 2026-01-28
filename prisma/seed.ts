import 'dotenv/config';
import { PrismaClient } from '@prisma/client';
import { Pool } from 'pg';
import { PrismaPg } from '@prisma/adapter-pg';
import * as bcrypt from 'bcrypt';

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
  await prisma.classBooking.deleteMany();
  await prisma.exercise.deleteMany();
  await prisma.workoutPlanVersion.deleteMany();
  await prisma.workoutPlan.deleteMany();
  await prisma.class.deleteMany();
  await prisma.membership.deleteMany();
  await prisma.membershipPlan.deleteMany();
  await prisma.member.deleteMany();
  await prisma.trainer.deleteMany();
  await prisma.user.deleteMany();

  // Hash password for all users
  const hashedPassword = await bcrypt.hash('Password123!', 10);

  // Create Admin User
  console.log('👤 Creating admin user...');
  await prisma.user.create({
    data: {
      email: 'admin@gym.com',
      password: hashedPassword,
      role: 'ADMIN',
    },
  });

  // Create Trainers
  console.log('🏋️ Creating trainers...');
  const trainer1User = await prisma.user.create({
    data: {
      email: 'sarah.johnson@gym.com',
      password: hashedPassword,
      role: 'TRAINER',
      trainer: {
        create: {
          firstName: 'Sarah',
          lastName: 'Johnson',
          specializations: ['Yoga', 'Pilates', 'Flexibility'],
          certifications: ['RYT-500', 'Pilates Instructor'],
        },
      },
    },
    include: { trainer: true },
  });

  const trainer2User = await prisma.user.create({
    data: {
      email: 'mike.chen@gym.com',
      password: hashedPassword,
      role: 'TRAINER',
      trainer: {
        create: {
          firstName: 'Mike',
          lastName: 'Chen',
          specializations: [
            'Strength Training',
            'Bodybuilding',
            'Powerlifting',
          ],
          certifications: ['NASM-CPT', 'CSCS'],
        },
      },
    },
    include: { trainer: true },
  });

  const trainer3User = await prisma.user.create({
    data: {
      email: 'emma.davis@gym.com',
      password: hashedPassword,
      role: 'TRAINER',
      trainer: {
        create: {
          firstName: 'Emma',
          lastName: 'Davis',
          specializations: ['Cardio', 'HIIT', 'Endurance'],
          certifications: ['ACE-CPT', 'HIIT Specialist'],
        },
      },
    },
    include: { trainer: true },
  });

  // Create Membership Plans
  console.log('💳 Creating membership plans...');
  const basicPlan = await prisma.membershipPlan.create({
    data: {
      name: 'Basic Monthly',
      description: 'Access to gym facilities during regular hours',
      durationDays: 30,
      price: 49.99,
      type: 'BASIC',
      features: ['Gym access', 'Locker room', 'Free WiFi'],
    },
  });

  const premiumPlan = await prisma.membershipPlan.create({
    data: {
      name: 'Premium Monthly',
      description: 'Full access with group classes',
      durationDays: 30,
      price: 79.99,
      type: 'PREMIUM',
      features: [
        'Gym access',
        'Group classes',
        'Locker room',
        'Free WiFi',
        'Towel service',
      ],
    },
  });

  const vipPlan = await prisma.membershipPlan.create({
    data: {
      name: 'VIP Monthly',
      description: 'Premium access with personal training',
      durationDays: 30,
      price: 149.99,
      type: 'VIP',
      features: [
        'Gym access',
        'Group classes',
        'Personal training sessions',
        'Locker room',
        'Free WiFi',
        'Towel service',
        'Nutrition consultation',
      ],
    },
  });

  // Create Members
  console.log('👥 Creating members...');
  const member1User = await prisma.user.create({
    data: {
      email: 'john.doe@example.com',
      password: hashedPassword,
      role: 'MEMBER',
      member: {
        create: {
          firstName: 'John',
          lastName: 'Doe',
          phone: '+1234567890',
          dateOfBirth: new Date('1990-05-15'),
        },
      },
    },
    include: { member: true },
  });

  const member2User = await prisma.user.create({
    data: {
      email: 'jane.smith@example.com',
      password: hashedPassword,
      role: 'MEMBER',
      member: {
        create: {
          firstName: 'Jane',
          lastName: 'Smith',
          phone: '+1234567891',
          dateOfBirth: new Date('1985-08-22'),
        },
      },
    },
    include: { member: true },
  });

  const member3User = await prisma.user.create({
    data: {
      email: 'alex.brown@example.com',
      password: hashedPassword,
      role: 'MEMBER',
      member: {
        create: {
          firstName: 'Alex',
          lastName: 'Brown',
          phone: '+1234567892',
          dateOfBirth: new Date('1995-03-10'),
        },
      },
    },
    include: { member: true },
  });

  const member4User = await prisma.user.create({
    data: {
      email: 'lisa.wilson@example.com',
      password: hashedPassword,
      role: 'MEMBER',
      member: {
        create: {
          firstName: 'Lisa',
          lastName: 'Wilson',
          phone: '+1234567893',
          dateOfBirth: new Date('1992-11-30'),
        },
      },
    },
    include: { member: true },
  });

  // Assign Memberships
  console.log('🎫 Assigning memberships...');
  const now = new Date();
  const thirtyDaysFromNow = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);

  await prisma.membership.create({
    data: {
      memberId: member1User.member!.id,
      planId: premiumPlan.id,
      startDate: now,
      endDate: thirtyDaysFromNow,
      status: 'ACTIVE',
    },
  });

  await prisma.membership.create({
    data: {
      memberId: member2User.member!.id,
      planId: vipPlan.id,
      startDate: now,
      endDate: thirtyDaysFromNow,
      status: 'ACTIVE',
    },
  });

  await prisma.membership.create({
    data: {
      memberId: member3User.member!.id,
      planId: basicPlan.id,
      startDate: now,
      endDate: thirtyDaysFromNow,
      status: 'ACTIVE',
    },
  });

  await prisma.membership.create({
    data: {
      memberId: member4User.member!.id,
      planId: premiumPlan.id,
      startDate: now,
      endDate: thirtyDaysFromNow,
      status: 'ACTIVE',
    },
  });

  // Create Classes
  console.log('📅 Creating classes...');
  const tomorrow = new Date(now.getTime() + 24 * 60 * 60 * 1000);
  const twoDaysFromNow = new Date(now.getTime() + 2 * 24 * 60 * 60 * 1000);

  const yogaClass = await prisma.class.create({
    data: {
      name: 'Morning Yoga Flow',
      description: 'Start your day with energizing yoga poses',
      trainerId: trainer1User.trainer!.id,
      schedule: new Date(tomorrow.setHours(8, 0, 0, 0)),
      duration: 60,
      capacity: 15,
      classType: 'Yoga',
    },
  });

  const strengthClass = await prisma.class.create({
    data: {
      name: 'Strength & Conditioning',
      description: 'Build muscle and increase strength',
      trainerId: trainer2User.trainer!.id,
      schedule: new Date(tomorrow.setHours(18, 0, 0, 0)),
      duration: 45,
      capacity: 12,
      classType: 'Strength',
    },
  });

  const hiitClass = await prisma.class.create({
    data: {
      name: 'HIIT Cardio Blast',
      description: 'High-intensity interval training for maximum calorie burn',
      trainerId: trainer3User.trainer!.id,
      schedule: new Date(twoDaysFromNow.setHours(17, 30, 0, 0)),
      duration: 30,
      capacity: 20,
      classType: 'Cardio',
    },
  });

  const pilatesClass = await prisma.class.create({
    data: {
      name: 'Core Pilates',
      description: 'Strengthen your core with Pilates exercises',
      trainerId: trainer1User.trainer!.id,
      schedule: new Date(twoDaysFromNow.setHours(10, 0, 0, 0)),
      duration: 50,
      capacity: 10,
      classType: 'Pilates',
    },
  });

  // Create Class Bookings
  console.log('📝 Creating class bookings...');
  await prisma.classBooking.create({
    data: {
      memberId: member1User.member!.id,
      classId: yogaClass.id,
      status: 'CONFIRMED',
    },
  });

  await prisma.classBooking.create({
    data: {
      memberId: member2User.member!.id,
      classId: yogaClass.id,
      status: 'CONFIRMED',
    },
  });

  await prisma.classBooking.create({
    data: {
      memberId: member1User.member!.id,
      classId: strengthClass.id,
      status: 'CONFIRMED',
    },
  });

  await prisma.classBooking.create({
    data: {
      memberId: member3User.member!.id,
      classId: hiitClass.id,
      status: 'CONFIRMED',
    },
  });

  await prisma.classBooking.create({
    data: {
      memberId: member4User.member!.id,
      classId: pilatesClass.id,
      status: 'CONFIRMED',
    },
  });

  // Create Attendance Records
  console.log('✅ Creating attendance records...');
  const yesterday = new Date(now.getTime() - 24 * 60 * 60 * 1000);
  const twoDaysAgo = new Date(now.getTime() - 2 * 24 * 60 * 60 * 1000);

  await prisma.attendance.create({
    data: {
      memberId: member1User.member!.id,
      type: 'GYM_VISIT',
      checkInTime: new Date(yesterday.setHours(7, 30, 0, 0)),
      checkOutTime: new Date(yesterday.setHours(9, 0, 0, 0)),
    },
  });

  await prisma.attendance.create({
    data: {
      memberId: member2User.member!.id,
      type: 'GYM_VISIT',
      checkInTime: new Date(yesterday.setHours(18, 0, 0, 0)),
      checkOutTime: new Date(yesterday.setHours(19, 30, 0, 0)),
    },
  });

  await prisma.attendance.create({
    data: {
      memberId: member3User.member!.id,
      type: 'GYM_VISIT',
      checkInTime: new Date(twoDaysAgo.setHours(6, 0, 0, 0)),
      checkOutTime: new Date(twoDaysAgo.setHours(7, 15, 0, 0)),
    },
  });

  // Create Workout Plans
  console.log('💪 Creating workout plans...');
  await prisma.workoutPlan.create({
    data: {
      name: 'Beginner Strength Program',
      description: 'A 4-week program for building foundational strength',
      memberId: member1User.member!.id,
      trainerId: trainer2User.trainer!.id,
      goal: 'MUSCLE_GAIN',
      exercises: {
        create: [
          {
            name: 'Barbell Squat',
            description: 'Compound lower body exercise',
            sets: 3,
            reps: 10,
            targetMuscles: ['Quadriceps', 'Glutes', 'Hamstrings'],
            order: 1,
          },
          {
            name: 'Bench Press',
            description: 'Compound upper body push exercise',
            sets: 3,
            reps: 10,
            targetMuscles: ['Chest', 'Triceps', 'Shoulders'],
            order: 2,
          },
          {
            name: 'Bent Over Row',
            description: 'Compound upper body pull exercise',
            sets: 3,
            reps: 10,
            targetMuscles: ['Back', 'Biceps'],
            order: 3,
          },
          {
            name: 'Overhead Press',
            description: 'Shoulder compound exercise',
            sets: 3,
            reps: 8,
            targetMuscles: ['Shoulders', 'Triceps'],
            order: 4,
          },
        ],
      },
    },
  });

  await prisma.workoutPlan.create({
    data: {
      name: 'Weight Loss Cardio Plan',
      description: 'High-intensity cardio for fat loss',
      memberId: member3User.member!.id,
      trainerId: trainer3User.trainer!.id,
      goal: 'WEIGHT_LOSS',
      exercises: {
        create: [
          {
            name: 'Treadmill Intervals',
            description: 'Sprint intervals on treadmill',
            sets: 8,
            reps: 1,
            duration: 120,
            targetMuscles: ['Legs', 'Cardiovascular'],
            order: 1,
          },
          {
            name: 'Burpees',
            description: 'Full body explosive movement',
            sets: 4,
            reps: 15,
            targetMuscles: ['Full Body', 'Cardiovascular'],
            order: 2,
          },
          {
            name: 'Jump Rope',
            description: 'Cardio conditioning',
            sets: 5,
            reps: 1,
            duration: 180,
            targetMuscles: ['Calves', 'Cardiovascular'],
            order: 3,
          },
        ],
      },
    },
  });

  await prisma.workoutPlan.create({
    data: {
      name: 'Flexibility & Mobility',
      description: 'Improve flexibility and range of motion',
      memberId: member2User.member!.id,
      trainerId: trainer1User.trainer!.id,
      goal: 'FLEXIBILITY',
      exercises: {
        create: [
          {
            name: 'Downward Dog',
            description: 'Yoga pose for hamstring and calf flexibility',
            sets: 3,
            reps: 1,
            duration: 60,
            targetMuscles: ['Hamstrings', 'Calves', 'Shoulders'],
            order: 1,
          },
          {
            name: 'Pigeon Pose',
            description: 'Hip opener stretch',
            sets: 3,
            reps: 1,
            duration: 90,
            targetMuscles: ['Hips', 'Glutes'],
            order: 2,
          },
          {
            name: 'Cat-Cow Stretch',
            description: 'Spinal mobility exercise',
            sets: 3,
            reps: 10,
            targetMuscles: ['Spine', 'Core'],
            order: 3,
          },
        ],
      },
    },
  });

  console.log('✅ Database seeding completed successfully!');
  console.log('\n📊 Summary:');
  console.log(`- Admin users: 1`);
  console.log(`- Trainers: 3`);
  console.log(`- Members: 4`);
  console.log(`- Membership plans: 3`);
  console.log(`- Active memberships: 4`);
  console.log(`- Classes: 4`);
  console.log(`- Class bookings: 5`);
  console.log(`- Attendance records: 3`);
  console.log(`- Workout plans: 3`);
  console.log('\n🔑 Login credentials (all users):');
  console.log('Password: Password123!');
  console.log('\nUsers:');
  console.log('- admin@gym.com (Admin)');
  console.log('- sarah.johnson@gym.com (Trainer)');
  console.log('- mike.chen@gym.com (Trainer)');
  console.log('- emma.davis@gym.com (Trainer)');
  console.log('- john.doe@example.com (Member)');
  console.log('- jane.smith@example.com (Member)');
  console.log('- alex.brown@example.com (Member)');
  console.log('- lisa.wilson@example.com (Member)');
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
