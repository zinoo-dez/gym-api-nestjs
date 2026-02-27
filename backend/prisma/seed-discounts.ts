import "dotenv/config";
import { PrismaClient } from "@prisma/client";
import { Pool } from "pg";
import { PrismaPg } from "@prisma/adapter-pg";

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function main() {
  console.log("🌱 Creating discount codes...");

  await prisma.discountCode.createMany({
    data: [
      {
        code: "SAVE10",
        description: "10% off for new members",
        type: "PERCENTAGE",
        amount: 10,
        isActive: true,
      },
      {
        code: "FIXED50",
        description: "50 units off",
        type: "FIXED",
        amount: 50,
        isActive: true,
      },
      {
        code: "EXPIRED",
        description: "Should not show",
        type: "PERCENTAGE",
        amount: 20,
        isActive: false,
      },
    ],
  });

  console.log("✅ Discount codes created!");
}

main()
  .catch((e) => {
    console.error("❌ Error:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
    await pool.end();
  });
