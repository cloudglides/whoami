import { PrismaClient } from './generated/prisma/client/index.js';

const prisma = new PrismaClient();

async function main() {
  // Get the most recent user
  const user = await prisma.user.findFirst({
    orderBy: { createdAt: 'desc' },
    select: { id: true, email: true, name: true, role: true }
  });
  
  if (!user) {
    console.log('No users found');
    return;
  }
  
  console.log('Current user:', user);
  
  // Update to SUPERADMIN
  const updated = await prisma.user.update({
    where: { id: user.id },
    data: { role: 'SUPERADMIN' },
    select: { id: true, email: true, name: true, role: true }
  });
  
  console.log('Updated to SUPERADMIN:', updated);
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
