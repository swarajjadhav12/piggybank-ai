import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting database seeding...');

  // Create a test user
  const hashedPassword = await bcrypt.hash('password123', 12);
  
  const user = await prisma.user.upsert({
    where: { email: 'test@example.com' },
    update: {},
    create: {
      email: 'test@example.com',
      phone: '+1234567890',
      password: hashedPassword,
      firstName: 'John',
      lastName: 'Doe',
    },
  });

  // Ensure wallet exists
  let wallet = await prisma.wallet.findUnique({ where: { userId: user.id } });
  if (!wallet) {
    wallet = await prisma.wallet.create({ data: { userId: user.id, balance: 1500, currency: 'USD' } });
  }

  console.log('✅ Ensured wallet with balance:', wallet.balance);

  // Create a second user as a counterparty for transfers
  const other = await prisma.user.upsert({
    where: { email: 'alice@example.com' },
    update: { phone: '+1987654321' }, // Update phone if user exists
    create: {
      email: 'alice@example.com',
      phone: '+1987654321',
      password: await bcrypt.hash('password123', 12),
      firstName: 'Alice',
      lastName: 'Smith',
    },
  });

  console.log('✅ Alice user created/updated:', { id: other.id, email: other.email, phone: other.phone });

  let otherWallet = await prisma.wallet.findUnique({ where: { userId: other.id } });
  if (!otherWallet) {
    otherWallet = await prisma.wallet.create({ data: { userId: other.id, balance: 500, currency: 'USD' } });
  }

  // Sample transactions
  await prisma.transaction.createMany({
    data: [
      {
        amount: 200,
        currency: 'USD',
        type: 'DEPOSIT',
        status: 'COMPLETED',
        description: 'Initial deposit',
        receiverWalletId: wallet.id,
        receiverUserId: user.id,
      },
      {
        amount: 50,
        currency: 'USD',
        type: 'TRANSFER',
        status: 'COMPLETED',
        description: 'Coffee payback',
        senderWalletId: wallet.id,
        senderUserId: user.id,
        receiverWalletId: otherWallet.id,
        receiverUserId: other.id,
      },
    ],
    skipDuplicates: true,
  });

  console.log('🎉 Database seeding completed successfully!');
  console.log('📧 Test user email: test@example.com');
  console.log('📱 Test user phone: +1234567890');
  console.log('🔑 Test user password: password123');
  console.log('💼 Wallet seeded with dummy transactions.');
  console.log('📱 Test receiver phone: +1987654321');
}

main()
  .catch((e) => {
    console.error('❌ Seeding failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
