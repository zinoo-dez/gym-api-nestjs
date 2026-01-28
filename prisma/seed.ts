import 'dotenv/config';
import { PrismaClient, WorkoutGoal } from '@prisma/client';
import { Pool } from 'pg';
import { PrismaPg } from '@prisma/adapter-pg';
import * as bcrypt from 'bcrypt';

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

// Configuration for seeding scale
const SEED_CONFIG = {
  TRAINERS: 100,
  MEMBERS: 100000,
  CLASSES: 10000,
  ATTENDANCE_RECORDS: 200000,
  WORKOUT_PLANS: 50000,
  CLASS_BOOKINGS: 100000,
  BATCH_SIZE: 1000,
};

// Helper functions for generating realistic data
const firstNames = [
  'James',
  'Mary',
  'John',
  'Patricia',
  'Robert',
  'Jennifer',
  'Michael',
  'Linda',
  'William',
  'Barbara',
  'David',
  'Elizabeth',
  'Richard',
  'Susan',
  'Joseph',
  'Jessica',
  'Thomas',
  'Sarah',
  'Charles',
  'Karen',
  'Christopher',
  'Nancy',
  'Daniel',
  'Lisa',
  'Matthew',
  'Betty',
  'Anthony',
  'Margaret',
  'Mark',
  'Sandra',
  'Donald',
  'Ashley',
  'Steven',
  'Kimberly',
  'Paul',
  'Emily',
  'Andrew',
  'Donna',
  'Joshua',
  'Michelle',
  'Kenneth',
  'Carol',
  'Kevin',
  'Amanda',
  'Brian',
  'Dorothy',
  'George',
  'Melissa',
];

const lastNames = [
  'Smith',
  'Johnson',
  'Williams',
  'Brown',
  'Jones',
  'Garcia',
  'Miller',
  'Davis',
  'Rodriguez',
  'Martinez',
  'Hernandez',
  'Lopez',
  'Gonzalez',
  'Wilson',
  'Anderson',
  'Thomas',
  'Taylor',
  'Moore',
  'Jackson',
  'Martin',
  'Lee',
  'Perez',
  'Thompson',
  'White',
  'Harris',
  'Sanchez',
  'Clark',
  'Ramirez',
  'Lewis',
  'Robinson',
  'Walker',
  'Young',
];

const specializations = [
  ['Yoga', 'Pilates', 'Flexibility'],
  ['Strength Training', 'Bodybuilding', 'Powerlifting'],
  ['Cardio', 'HIIT', 'Endurance'],
  ['CrossFit', 'Functional Training', 'Athletic Performance'],
  ['Boxing', 'Kickboxing', 'Martial Arts'],
  ['Spinning', 'Cycling', 'Indoor Cycling'],
  ['Swimming', 'Aqua Fitness', 'Water Sports'],
  ['Dance', 'Zumba', 'Aerobics'],
  ['Nutrition', 'Weight Management', 'Wellness'],
  ['Rehabilitation', 'Injury Prevention', 'Mobility'],
];

const certifications = [
  ['NASM-CPT', 'ACE-CPT'],
  ['ISSA-CPT', 'ACSM-CPT'],
  ['RYT-500', 'Pilates Instructor'],
  ['CSCS', 'NSCA-CPT'],
  ['CrossFit Level 2', 'CrossFit Level 3'],
];

const classTypes = [
  'Yoga',
  'Pilates',
  'Strength',
  'Cardio',
  'HIIT',
  'CrossFit',
  'Boxing',
  'Spinning',
  'Zumba',
  'Swimming',
  'Bootcamp',
  'Stretching',
  'Core',
];

const classNames = [
  'Morning Flow',
  'Power Hour',
  'Strength & Conditioning',
  'Cardio Blast',
  'HIIT Burn',
  'CrossFit WOD',
  'Boxing Basics',
  'Spin Class',
  'Zumba Party',
  'Aqua Fitness',
  'Bootcamp Challenge',
  'Flexibility Focus',
  'Core Crusher',
];

const exerciseLibrary = [
  {
    name: 'Barbell Squat',
    muscles: ['Quadriceps', 'Glutes', 'Hamstrings'],
    sets: 4,
    reps: 10,
  },
  {
    name: 'Bench Press',
    muscles: ['Chest', 'Triceps', 'Shoulders'],
    sets: 4,
    reps: 8,
  },
  {
    name: 'Deadlift',
    muscles: ['Back', 'Glutes', 'Hamstrings'],
    sets: 3,
    reps: 6,
  },
  {
    name: 'Overhead Press',
    muscles: ['Shoulders', 'Triceps'],
    sets: 3,
    reps: 8,
  },
  { name: 'Bent Over Row', muscles: ['Back', 'Biceps'], sets: 4, reps: 10 },
  { name: 'Pull-ups', muscles: ['Back', 'Biceps'], sets: 3, reps: 8 },
  { name: 'Dips', muscles: ['Chest', 'Triceps'], sets: 3, reps: 10 },
  { name: 'Lunges', muscles: ['Quadriceps', 'Glutes'], sets: 3, reps: 12 },
  { name: 'Plank', muscles: ['Core', 'Abs'], sets: 3, reps: 1, duration: 60 },
  {
    name: 'Burpees',
    muscles: ['Full Body', 'Cardiovascular'],
    sets: 4,
    reps: 15,
  },
  {
    name: 'Jump Rope',
    muscles: ['Calves', 'Cardiovascular'],
    sets: 5,
    reps: 1,
    duration: 120,
  },
];

const workoutGoals: WorkoutGoal[] = [
  'WEIGHT_LOSS',
  'MUSCLE_GAIN',
  'ENDURANCE',
  'FLEXIBILITY',
];

function randomElement<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

function randomDate(start: Date, end: Date): Date {
  return new Date(
    start.getTime() + Math.random() * (end.getTime() - start.getTime()),
  );
}

function generateEmail(
  firstName: string,
  lastName: string,
  index: number,
): string {
  return `${firstName.toLowerCase()}.${lastName.toLowerCase()}${index}@gym.com`;
}

function generatePhone(): string {
  return `+1${Math.floor(1000000000 + Math.random() * 9000000000)}`;
}

async function batchInsert<T>(
  items: T[],
  insertFn: (batch: T[]) => Promise<any>,
  batchSize: number = SEED_CONFIG.BATCH_SIZE,
  label: string = 'items',
) {
  const total = items.length;
  let processed = 0;

  for (let i = 0; i < items.length; i += batchSize) {
    const batch = items.slice(i, i + batchSize);
    await insertFn(batch);
    processed += batch.length;
    console.log(
      `  ✓ ${label}: ${processed}/${total} (${Math.round((processed / total) * 100)}%)`,
    );
  }
}

async function main() {
  console.log('🌱 Starting large-scale database seeding...');
  console.log(
    `📊 Target: ~${Object.values(SEED_CONFIG)
      .reduce((a, b) => (typeof b === 'number' ? a + b : a), 0)
      .toLocaleString()} records\n`,
  );

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
  console.log('✓ Cleaned\n');

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
  console.log('✓ Admin created\n');

  // Create Membership Plans
  console.log('💳 Creating membership plans...');
  const membershipPlans = await Promise.all([
    prisma.membershipPlan.create({
      data: {
        name: 'Basic Monthly',
        description: 'Access to gym facilities during regular hours',
        durationDays: 30,
        price: 49.99,
        type: 'BASIC',
        features: ['Gym access', 'Locker room', 'Free WiFi'],
      },
    }),
    prisma.membershipPlan.create({
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
    }),
    prisma.membershipPlan.create({
      data: {
        name: 'VIP Monthly',
        description: 'Premium access with personal training',
        durationDays: 30,
        price: 149.99,
        type: 'VIP',
        features: [
          'Gym access',
          'Group classes',
          'Personal training',
          'Locker room',
          'Free WiFi',
          'Towel service',
          'Nutrition consultation',
        ],
      },
    }),
  ]);
  console.log('✓ 3 membership plans created\n');

  // Create Trainers
  console.log(`🏋️ Creating ${SEED_CONFIG.TRAINERS} trainers...`);
  const trainerData = [];
  for (let i = 0; i < SEED_CONFIG.TRAINERS; i++) {
    const firstName = randomElement(firstNames);
    const lastName = randomElement(lastNames);
    trainerData.push({
      email: generateEmail(firstName, lastName, i),
      password: hashedPassword,
      role: 'TRAINER' as const,
      trainer: {
        create: {
          firstName,
          lastName,
          specializations: randomElement(specializations),
          certifications: randomElement(certifications),
        },
      },
    });
  }

  await batchInsert(
    trainerData,
    async (batch) => {
      await Promise.all(
        batch.map((data) =>
          prisma.user.create({ data, include: { trainer: true } }),
        ),
      );
    },
    100,
    'Trainers',
  );

  const trainers = await prisma.trainer.findMany();
  console.log(`✓ ${trainers.length} trainers created\n`);

  // Create Members
  console.log(`👥 Creating ${SEED_CONFIG.MEMBERS} members...`);
  const memberData = [];
  for (let i = 0; i < SEED_CONFIG.MEMBERS; i++) {
    const firstName = randomElement(firstNames);
    const lastName = randomElement(lastNames);
    memberData.push({
      email: generateEmail(firstName, lastName, i),
      password: hashedPassword,
      role: 'MEMBER' as const,
      member: {
        create: {
          firstName,
          lastName,
          phone: generatePhone(),
          dateOfBirth: randomDate(
            new Date('1960-01-01'),
            new Date('2005-12-31'),
          ),
        },
      },
    });
  }

  await batchInsert(
    memberData,
    async (batch) => {
      await Promise.all(
        batch.map((data) =>
          prisma.user.create({ data, include: { member: true } }),
        ),
      );
    },
    500,
    'Members',
  );

  const members = await prisma.member.findMany();
  console.log(`✓ ${members.length} members created\n`);

  // Assign Memberships
  console.log(`🎫 Assigning memberships to members...`);
  const now = new Date();
  const membershipData = members.map((member) => {
    const plan = randomElement(membershipPlans);
    const startDate = randomDate(
      new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000),
      now,
    );
    const endDate = new Date(
      startDate.getTime() + plan.durationDays * 24 * 60 * 60 * 1000,
    );
    const isExpired = endDate < now;

    return {
      memberId: member.id,
      planId: plan.id,
      startDate,
      endDate,
      status: isExpired
        ? ('EXPIRED' as const)
        : Math.random() > 0.05
          ? ('ACTIVE' as const)
          : ('CANCELLED' as const),
    };
  });

  await batchInsert(
    membershipData,
    async (batch) => {
      await prisma.membership.createMany({ data: batch });
    },
    SEED_CONFIG.BATCH_SIZE,
    'Memberships',
  );
  console.log(`✓ ${membershipData.length} memberships assigned\n`);

  // Create Classes
  console.log(`📅 Creating ${SEED_CONFIG.CLASSES} classes...`);
  const classData = [];
  const startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
  const endDate = new Date(now.getTime() + 60 * 24 * 60 * 60 * 1000);

  for (let i = 0; i < SEED_CONFIG.CLASSES; i++) {
    const schedule = randomDate(startDate, endDate);
    schedule.setMinutes(0, 0, 0);

    classData.push({
      name: `${randomElement(classNames)} ${i + 1}`,
      description: `Join us for an amazing ${randomElement(classTypes)} session`,
      trainerId: randomElement(trainers).id,
      schedule,
      duration: [30, 45, 60, 90][Math.floor(Math.random() * 4)],
      capacity: Math.floor(Math.random() * 20) + 10,
      classType: randomElement(classTypes),
    });
  }

  await batchInsert(
    classData,
    async (batch) => {
      await prisma.class.createMany({ data: batch });
    },
    SEED_CONFIG.BATCH_SIZE,
    'Classes',
  );

  const classes = await prisma.class.findMany();
  console.log(`✓ ${classes.length} classes created\n`);

  // Create Class Bookings
  console.log(`📝 Creating ${SEED_CONFIG.CLASS_BOOKINGS} class bookings...`);
  const bookingData = [];
  const bookingSet = new Set<string>();

  for (let i = 0; i < SEED_CONFIG.CLASS_BOOKINGS; i++) {
    let member, classItem, key;
    let attempts = 0;

    do {
      member = randomElement(members);
      classItem = randomElement(classes);
      key = `${member.id}-${classItem.id}`;
      attempts++;
    } while (bookingSet.has(key) && attempts < 10);

    if (!bookingSet.has(key)) {
      bookingSet.add(key);
      bookingData.push({
        memberId: member.id,
        classId: classItem.id,
        status:
          Math.random() > 0.1
            ? ('CONFIRMED' as const)
            : Math.random() > 0.5
              ? ('ATTENDED' as const)
              : ('CANCELLED' as const),
      });
    }
  }

  await batchInsert(
    bookingData,
    async (batch) => {
      await prisma.classBooking.createMany({
        data: batch,
        skipDuplicates: true,
      });
    },
    SEED_CONFIG.BATCH_SIZE,
    'Class Bookings',
  );
  console.log(`✓ ${bookingData.length} class bookings created\n`);

  // Create Attendance Records
  console.log(
    `✅ Creating ${SEED_CONFIG.ATTENDANCE_RECORDS} attendance records...`,
  );
  const attendanceData = [];
  const attendanceStartDate = new Date(
    now.getTime() - 90 * 24 * 60 * 60 * 1000,
  );

  for (let i = 0; i < SEED_CONFIG.ATTENDANCE_RECORDS; i++) {
    const member = randomElement(members);
    const checkInTime = randomDate(attendanceStartDate, now);
    const checkOutTime = new Date(
      checkInTime.getTime() + (Math.random() * 3 + 0.5) * 60 * 60 * 1000,
    );

    attendanceData.push({
      memberId: member.id,
      classId: Math.random() > 0.7 ? randomElement(classes).id : null,
      checkInTime,
      checkOutTime: Math.random() > 0.1 ? checkOutTime : null,
      type:
        Math.random() > 0.3
          ? ('GYM_VISIT' as const)
          : ('CLASS_ATTENDANCE' as const),
    });
  }

  await batchInsert(
    attendanceData,
    async (batch) => {
      await prisma.attendance.createMany({ data: batch });
    },
    SEED_CONFIG.BATCH_SIZE,
    'Attendance Records',
  );
  console.log(`✓ ${attendanceData.length} attendance records created\n`);

  // Create Workout Plans with Exercises
  console.log(`💪 Creating ${SEED_CONFIG.WORKOUT_PLANS} workout plans...`);
  let workoutPlansCreated = 0;

  for (let i = 0; i < SEED_CONFIG.WORKOUT_PLANS; i += SEED_CONFIG.BATCH_SIZE) {
    const batchSize = Math.min(
      SEED_CONFIG.BATCH_SIZE,
      SEED_CONFIG.WORKOUT_PLANS - i,
    );
    const workoutPromises = [];

    for (let j = 0; j < batchSize; j++) {
      const member = randomElement(members);
      const trainer = randomElement(trainers);
      const goal = randomElement(workoutGoals);
      const numExercises = Math.floor(Math.random() * 5) + 3;

      const exercises = [];
      for (let k = 0; k < numExercises; k++) {
        const exercise = randomElement(exerciseLibrary);
        exercises.push({
          name: exercise.name,
          description: `${exercise.name} exercise`,
          sets: exercise.sets,
          reps: exercise.reps,
          duration: exercise.duration || null,
          targetMuscles: exercise.muscles,
          order: k + 1,
        });
      }

      workoutPromises.push(
        prisma.workoutPlan.create({
          data: {
            name: `${goal} Program ${i + j + 1}`,
            description: `Customized ${goal.toLowerCase().replace('_', ' ')} workout plan`,
            memberId: member.id,
            trainerId: trainer.id,
            goal,
            exercises: {
              create: exercises,
            },
          },
        }),
      );
    }

    await Promise.all(workoutPromises);
    workoutPlansCreated += batchSize;
    console.log(
      `  ✓ Workout Plans: ${workoutPlansCreated}/${SEED_CONFIG.WORKOUT_PLANS} (${Math.round((workoutPlansCreated / SEED_CONFIG.WORKOUT_PLANS) * 100)}%)`,
    );
  }
  console.log(`✓ ${workoutPlansCreated} workout plans created\n`);

  // Final Summary
  const finalCounts = {
    users: await prisma.user.count(),
    trainers: await prisma.trainer.count(),
    members: await prisma.member.count(),
    membershipPlans: await prisma.membershipPlan.count(),
    memberships: await prisma.membership.count(),
    classes: await prisma.class.count(),
    classBookings: await prisma.classBooking.count(),
    attendance: await prisma.attendance.count(),
    workoutPlans: await prisma.workoutPlan.count(),
    exercises: await prisma.exercise.count(),
  };

  console.log('✅ Database seeding completed successfully!\n');
  console.log('📊 Final Summary:');
  console.log(`- Total Users: ${finalCounts.users.toLocaleString()}`);
  console.log(`- Admin Users: 1`);
  console.log(`- Trainers: ${finalCounts.trainers.toLocaleString()}`);
  console.log(`- Members: ${finalCounts.members.toLocaleString()}`);
  console.log(`- Membership Plans: ${finalCounts.membershipPlans}`);
  console.log(
    `- Active Memberships: ${finalCounts.memberships.toLocaleString()}`,
  );
  console.log(`- Classes: ${finalCounts.classes.toLocaleString()}`);
  console.log(
    `- Class Bookings: ${finalCounts.classBookings.toLocaleString()}`,
  );
  console.log(
    `- Attendance Records: ${finalCounts.attendance.toLocaleString()}`,
  );
  console.log(`- Workout Plans: ${finalCounts.workoutPlans.toLocaleString()}`);
  console.log(`- Exercises: ${finalCounts.exercises.toLocaleString()}`);
  console.log(
    `\n📈 Total Records: ${Object.values(finalCounts)
      .reduce((a, b) => a + b, 0)
      .toLocaleString()}`,
  );
  console.log('\n🔑 Login credentials:');
  console.log('- Email: admin@gym.com');
  console.log('- Password: Password123!');
  console.log(
    '\nAll other users (trainers/members) use the same password: Password123!',
  );
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
