import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  const email = process.env.ADMIN_EMAIL;
  const password = process.env.ADMIN_PASSWORD;

  if (!email || !password) {
    console.log("ADMIN_EMAIL/ADMIN_PASSWORD not set — skipping admin user bootstrap.");
    return;
  }

  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) {
    // Re-run on an already-seeded install (e.g. after upgrading to the
    // isSuperAdmin field) still needs to grant this — without it, a
    // pre-existing install would have no super admin at all and nobody
    // could delete a Tim-mode project (see canDeleteProject()).
    if (!existing.isSuperAdmin) {
      await prisma.user.update({ where: { email }, data: { isSuperAdmin: true } });
      console.log(`Granted isSuperAdmin to existing user ${email}.`);
    } else {
      console.log(`User ${email} already exists — skipping.`);
    }
    return;
  }

  const passwordHash = await bcrypt.hash(password, 10);
  await prisma.user.create({ data: { email, passwordHash, isSuperAdmin: true } });
  console.log(`Created bootstrap super admin user ${email}.`);
}

main()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
