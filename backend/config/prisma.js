const { PrismaClient } = require('@prisma/client');

process.env.PRISMA_CLIENT_ENGINE_TYPE = 'library';

let prisma;

if (process.env.NODE_ENV === 'production') {
  prisma = new PrismaClient({
    datasources: {
      db: {
        url: process.env.DATABASE_URL + "&connect_timeout=60" // Extended timeout for cold starts
      }
    }
  });
} else {
  if (!global.prisma) {
    global.prisma = new PrismaClient({
      log: ['warn', 'error'],
      datasources: {
        db: {
          url: process.env.DATABASE_URL + "&connect_timeout=30" // Local dev timeout
        }
      }
    });
  }
  prisma = global.prisma;
}

module.exports = prisma;
