import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function seedData() {
  const scheduleTypesData = [
    { name: 'Simple Physical #3' },
    { name: 'Simple Digital #3' },
    { name: 'Complex Physical #3' },
    { name: 'Complex Digital #3' },
    { name: '3-Day In-Lab' },
    { name: 'Elite #1' },
    { name: 'Elite #2' },
    { name: 'Elite #3' },
  ];

  // Data for Pan
  const panNumbers = [
    'S3',
    'S3PLUS',
    'S3D',
    'S3DPLUS',
    'C3',
    'C3PLUS',
    'C3D',
    'C3DPLUS',
    'ELITE 1',
    'ELITE 1D',
    'ELITE 2',
    'ELITE 2D',
    'ELITE 3',
    'ELITE 3D',
    'IN HOUSE',
  ];

  try {
    await prisma.scheduleType.createMany({
      data: scheduleTypesData,
      skipDuplicates: true,
    });

    const scheduleTypes = await prisma.scheduleType.findMany();

    await Promise.all(
      panNumbers.map(async (panNumber) => {
        // Randomly select a schedule type ID
        const randomScheduleType =
          scheduleTypes[Math.floor(Math.random() * scheduleTypes.length)];

        // Create Pan records with a valid scheduleTypeId
        const pan = await prisma.pan.create({
          data: {
            panNumber,
            scheduleTypeId: randomScheduleType.id
          }
        });
        return pan;
      })
    );
  } catch (error) {
  } finally {
    await prisma.$disconnect();
  }
}

seedData();
