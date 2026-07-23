import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
  const candidates = await prisma.user.findMany({ where: { role: 'CANDIDATE' }, include: { candidate: true } });
  
  if (candidates.length === 0) {
    console.log("No candidates found.");
    return;
  }
  
  const cUser = candidates[0];
  const cProfileId = cUser.candidate?.id;
  
  if (!cProfileId) {
    console.log("Candidate profile missing for user", cUser.email);
    return;
  }

  // Create a mock company user
  const companyUser = await prisma.user.upsert({
    where: { email: 'mock_company@example.com' },
    update: {},
    create: {
      email: 'mock_company@example.com',
      role: 'COMPANY',
      name: 'Sony Interactive',
      isVerified: true
    }
  });

  // Create mock company profile
  const companyProfile = await prisma.companyProfile.upsert({
    where: { userId: companyUser.id },
    update: {},
    create: {
      userId: companyUser.id,
      companyName: 'Sony Interactive Entertainment',
      locationJapan: 'Tokyo',
      isApproved: true,
      logoUrl: 'https://upload.wikimedia.org/wikipedia/commons/4/43/PlayStation_logo.svg'
    }
  });

  // Create a mock job
  const job = await prisma.job.create({
    data: {
      companyId: companyProfile.id,
      title: 'Senior Frontend Engineer (React/Next.js)',
      description: 'Join our PlayStation network web team.',
      location: 'Tokyo, Japan',
      jlptRequired: 'N3',
      isActive: true
    }
  });

  // Create an application
  const app = await prisma.application.create({
    data: {
      candidateId: cProfileId,
      jobId: job.id,
      status: 'SHORTLISTED',
      coverNote: 'I love PlayStation.'
    }
  });

  // Create a conversation
  const conv = await prisma.conversation.create({
    data: {
      candidateId: cProfileId,
      companyId: companyProfile.id,
      jobId: job.id,
    }
  });

  // Create some messages
  await prisma.message.create({
    data: {
      conversationId: conv.id,
      senderId: companyUser.id,
      body: 'Hi there! We reviewed your profile and were very impressed with your frontend skills. Would you be open to an interview next week?',
      isRead: false
    }
  });

  console.log("Successfully seeded chat between", cUser.email, "and Sony Interactive.");
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
