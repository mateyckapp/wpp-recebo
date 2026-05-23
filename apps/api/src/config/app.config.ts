import { registerAs } from '@nestjs/config';

export const appConfig = registerAs('app', () => ({
  port: parseInt(process.env['PORT'] ?? '3001', 10),
  nodeEnv: process.env['NODE_ENV'] ?? 'development',
  corsOrigin: process.env['CORS_ORIGIN'] ?? 'http://localhost:3000',
  appDomain: process.env['APP_DOMAIN'] ?? 'wpprecebo.com',
  apiUrl: process.env['API_URL'] ?? 'http://localhost:3001',
  jwt: {
    secret: process.env['JWT_SECRET'] ?? 'change-me-in-production',
    refreshSecret: process.env['JWT_REFRESH_SECRET'] ?? 'change-me-refresh-in-production',
    expiresIn: process.env['JWT_EXPIRES_IN'] ?? '15m',
    refreshExpiresIn: process.env['JWT_REFRESH_EXPIRES_IN'] ?? '30d',
  },
  whatsapp: {
    verifyToken: process.env['WHATSAPP_VERIFY_TOKEN'] ?? '',
    appSecret: process.env['WHATSAPP_APP_SECRET'] ?? '',
  },
  anthropic: {
    apiKey: process.env['ANTHROPIC_API_KEY'] ?? '',
    haikuModel: process.env['CLAUDE_HAIKU_MODEL'] ?? 'claude-haiku-4-5-20251001',
    sonnetModel: process.env['CLAUDE_SONNET_MODEL'] ?? 'claude-sonnet-4-6',
  },
}));
