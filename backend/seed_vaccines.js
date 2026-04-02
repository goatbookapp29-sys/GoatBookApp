const { PrismaClient } = require('@prisma/client');
const { v4: uuidv4 } = require('uuid');
const prisma = new PrismaClient();

async function main() {
  console.log('--- STARTING VACCINE SEEDING ---');

  const defaultVaccines = [
    {
      name: 'PPR',
      disease_name: 'Peste des petits Ruminants',
      dose_ml: 1.0,
      application_route: 'Sub Cut S/c',
      immunity_duration_days: 1460, // 4 years
      days_between: 1095, // 3 years
      remark: 'Standard PPR vaccine for long-term immunity',
      is_default: true
    },
    {
      name: 'ET',
      disease_name: 'Enterotoximia',
      dose_ml: 2.0,
      application_route: 'Sub Cut S/c',
      immunity_duration_days: 365,
      days_between: 365,
      remark: 'Critical vaccine for pulpy kidney disease',
      is_default: true
    },
    {
      name: 'FMD',
      disease_name: 'Foot and Mouth Disease',
      dose_ml: 0.5,
      application_route: 'Intra Muscular I/M',
      immunity_duration_days: 365,
      days_between: 365,
      remark: 'Protects against FMD virus',
      is_default: true
    },
    {
      name: 'HS',
      disease_name: 'Hemoregic septicimiya',
      dose_ml: 0.5,
      application_route: 'Intra Muscular I/M',
      immunity_duration_days: 365,
      days_between: 365,
      remark: 'Protects against HS bacteria',
      is_default: true
    },
    {
      name: 'FMD + HS (Biovac)',
      disease_name: 'Foot and Mouth Disease + Hemoregic septicimiya',
      dose_ml: 1.0,
      application_route: 'Intra Muscular I/M',
      immunity_duration_days: 365,
      days_between: 365,
      remark: 'Combined Bio-vaccine',
      is_default: true
    },
    {
      name: 'Goat Pox',
      disease_name: 'Goat Pox',
      dose_ml: 1.0,
      application_route: 'Sub Cut S/c',
      immunity_duration_days: 365,
      days_between: 365,
      remark: 'Protects against Goat Pox virus',
      is_default: true
    },
    {
      name: 'FMD + HS + BQ (Triovac)',
      disease_name: 'Foot and Mouth Disease + Hemoregic septicimiya + Black Quarter',
      dose_ml: 1.0,
      application_route: 'Intra Muscular I/M',
      immunity_duration_days: 365,
      days_between: 365,
      remark: 'Premium trivalent vaccine',
      is_default: true
    }
  ];

  for (const v of defaultVaccines) {
    const existing = await prisma.vaccines.findFirst({
      where: { name: v.name, is_default: true }
    });

    if (!existing) {
      await prisma.vaccines.create({
        data: {
          id: uuidv4(),
          ...v
        }
      });
      console.log(`+ Added Vaccine: ${v.name}`);
    } else {
      console.log(`~ Vaccine already exists: ${v.name}`);
    }
  }

  console.log('--- SEEDING COMPLETE ---');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
