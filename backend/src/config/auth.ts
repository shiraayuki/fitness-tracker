export const authConfig = {
  jwtSecret: process.env.JWT_SECRET || 'change-me-in-production',
  tokenExpiry: (process.env.TOKEN_EXPIRY || '24h') as string | number,
  adminPasswordHash: process.env.ADMIN_PASSWORD_HASH || '',
  bcryptRounds: 10,
};

if (!authConfig.adminPasswordHash && process.env.NODE_ENV === 'production') {
  console.warn('WARNING: ADMIN_PASSWORD_HASH not set in production!');
}

if (authConfig.jwtSecret === 'change-me-in-production' && process.env.NODE_ENV === 'production') {
  console.error('FATAL: JWT_SECRET must be set in production!');
  process.exit(1);
}
