import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

async function main() {
  await prisma.employee.createMany({
    data: [
      { name: "Divya Singh", email: "divya@aiworkspace.com", role: "ADMIN" },
      { name: "Aarav Patel", email: "aarav@aiworkspace.com", role: "EMPLOYEE" },
    ],
  });
  console.log("✅ Seeded employees!");
}

main()
  .catch((e) => console.error(e))
  .finally(() => prisma.$disconnect());