import { createHttpServer } from './http/server';
import { createAuthController } from './modules/auth/auth.factory';
import { createContactController } from './modules/contact/contact.factory';

const port = Number(process.env.PORT ?? 3000);
const host = process.env.HOST ?? '0.0.0.0';

if (!Number.isInteger(port) || port < 1 || port > 65_535) {
  throw new Error('PORT must be an integer between 1 and 65535');
}

const server = createHttpServer({
  authController: createAuthController(),
  contactController: createContactController(),
});

const { port: boundPort } = await server.start(port, host);
console.log(`LinkUp API listening on ${host}:${boundPort}`);

const shutdown = async (signal: string) => {
  console.log(`Received ${signal}; shutting down LinkUp API`);
  await server.stop();
  process.exit(0);
};

process.once('SIGTERM', () => void shutdown('SIGTERM'));
process.once('SIGINT', () => void shutdown('SIGINT'));
