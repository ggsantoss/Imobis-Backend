import dotenv from 'dotenv';

dotenv.config();

interface EnvConfig {
  JWT_SECRET: string;
  JWT_EXPIRES_IN: string;
  DATABASE_URL: string;
  SMTP_SECRET: string;
  MP_ACCESS_TOKEN: string;
}

const getEnvConfig = (): EnvConfig => {
  return {
    JWT_SECRET: process.env.JWT_SECRET || 'default_secret_key',
    JWT_EXPIRES_IN: process.env.JWT_EXPIRES_IN || '1h',
    SMTP_SECRET: process.env.SMTP_SECRET || 'default_SMTP_secret',
    MP_ACCESS_TOKEN: process.env.MP_ACCESS_TOKEN || '',
    DATABASE_URL:
      process.env.DATABASE_URL ||
      'postgresql://root:root@localhost:5432/mydb?schema=public',
  };
};

export const envConfig = getEnvConfig();
