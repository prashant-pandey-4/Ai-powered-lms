import app from './app';
import { env } from './config/env';
import { prisma } from './config/prisma';

const PORT = parseInt(env.PORT, 10);

async function main() {
  // Start Express server immediately
  app.listen(PORT, () => {
    console.log(`🚀 Server running on http://localhost:${PORT}`);
    console.log(`   Health: http://localhost:${PORT}/health`);
  });

  // Verify DB connection in background without crashing on cold-start
  try {
    await prisma.$queryRaw`SELECT 1`;
    console.log('✅ Database connected (Neon PostgreSQL)');
  } catch (err: any) {
    console.warn('⚠️ Database connecting in background / cold-starting...');
  }
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
