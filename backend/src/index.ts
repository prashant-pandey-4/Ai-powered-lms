import app from './app';
import { env } from './config/env';
import { prisma } from './config/prisma';

const PORT = parseInt(env.PORT, 10);

async function connectWithRetry(retries = 5, delay = 2000) {
  for (let i = 1; i <= retries; i++) {
    try {
      await prisma.$queryRaw`SELECT 1`;
      console.log('✅ Database connected (Neon PostgreSQL)');
      return;
    } catch {
      if (i < retries) {
        await new Promise((r) => setTimeout(r, delay));
      }
    }
  }
}

async function main() {
  app.listen(PORT, () => {
    console.log(`🚀 Server running on http://localhost:${PORT}`);
    console.log(`   Health: http://localhost:${PORT}/health`);
  });

  // Background connection check with silent retry on cold-start
  connectWithRetry();
}

main();

// Graceful shutdown
process.on('SIGINT', async () => {
  await prisma.$disconnect();
  console.log('\n Server stopped gracefully');
  process.exit(0);
});

process.on('SIGTERM', async () => {
  await prisma.$disconnect();
  process.exit(0);
});
