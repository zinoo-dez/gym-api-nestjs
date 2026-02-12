import { PrismaClient, UserRole } from '@prisma/client';
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

async function resetSuperadmin() {
  //   console.log('Resetting superadmin account...');

  const superadminEmail = process.env.SUPERADMIN_EMAIL || 'superadmin@gym.com';
  const superadminPassword =
    process.env.SUPERADMIN_PASSWORD || 'SuperAdmin123!';
  const superadminFirstName =
    process.env.SUPERADMIN_FIRST_NAME || 'Super';
  const superadminLastName = process.env.SUPERADMIN_LAST_NAME || 'Admin';

  // Delete existing superadmin if exists
  const existing = await prisma.user.findUnique({
    where: { email: superadminEmail },
  });

  if (existing) {
    await prisma.user.delete({
      where: { email: superadminEmail },
    });
    // console.log('✅ Deleted existing superadmin account');
  }

  // Create new superadmin with fresh password
  const hashedPassword = await bcrypt.hash(superadminPassword, 10);

  await prisma.user.create({
    data: {
      email: superadminEmail,
      password: hashedPassword,
      firstName: superadminFirstName,
      lastName: superadminLastName,
      role: UserRole.ADMIN,
    },
  });

  //   console.log('\n✅ Superadmin account reset successfully!');
  //   console.log(`   Email: ${superadminEmail}`);
  //   console.log(`   Password: ${superadminPassword}`);
  //   console.log(`   ID: ${superadmin.id}`);
  //   console.log('\nYou can now login with these credentials.');
}

resetSuperadmin()
  .catch((e) => {
    console.error('❌ Error resetting superadmin:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
    await pool.end();
  });
