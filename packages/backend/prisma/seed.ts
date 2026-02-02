import { PrismaClient, Role } from '@prisma/client';
import { Pool } from 'pg';
import { PrismaPg } from '@prisma/adapter-pg';
import * as bcrypt from 'bcrypt';
import * as dotenv from 'dotenv';

// Load environment variables
dotenv.config();

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});
const adapter = new PrismaPg(pool);

const prisma = new PrismaClient({ adapter });

async function main() {
  console.log('Starting database seeding...');

  // Create default superadmin account
  const superadminEmail = process.env.SUPERADMIN_EMAIL || 'superadmin@gym.com';
  const superadminPassword =
    process.env.SUPERADMIN_PASSWORD || 'SuperAdmin123!';

  const existingSuperadmin = await prisma.user.findUnique({
    where: { email: superadminEmail },
  });

  if (!existingSuperadmin) {
    const hashedPassword = await bcrypt.hash(superadminPassword, 10);

    const superadmin = await prisma.user.create({
      data: {
        email: superadminEmail,
        password: hashedPassword,
        role: Role.SUPERADMIN,
      },
    });

    console.log('✅ Superadmin account created:');
    console.log(`   Email: ${superadminEmail}`);
    console.log(`   Password: ${superadminPassword}`);
    console.log(`   ID: ${superadmin.id}`);
  } else {
    console.log('ℹ️  Superadmin account already exists');
    console.log(`   Email: ${superadminEmail}`);
  }

  console.log('\n✅ Database seeding completed!');
}

main()
  .catch((e) => {
    console.error('❌ Error during seeding:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
    await pool.end();
  });
