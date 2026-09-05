import { prisma } from "./lib/prisma";

async function main() {
  const user = await prisma.user.findFirst({
    orderBy: { createdAt: 'desc' },
    select: { id: true, email: true, name: true, role: true }
  });
  
  if (!user) {
    console.log('No users found');
    return;
  }
  
  console.log('Current user:', user);
  
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