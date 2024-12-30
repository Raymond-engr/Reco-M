import dotenv from 'dotenv';
import { cleanEnv, str, port, url, email } from 'envalid';
dotenv.config();

const validateEnv = (): void => {
  cleanEnv(process.env, {
    NODE_ENV: str({ choices: ['development', 'test', 'production'] }),
    PORT: port(),
    MONGODB_URI: url(),
    GEMINI_API_KEY: str(),
    FRONTEND_URL: url(),
    LOG_LEVEL: str({ choices: ['error', 'warn', 'info', 'http', 'verbose', 'debug', 'silly'] }),
    TMDB_API_KEY: str(),
    OMDB_API_KEY: str(),
    JWT_ACCESS_SECRET: str(),
    JWT_REFRESH_SECRET: str(),
    GOOGLE_CLIENT_ID: str(),
    GOOGLE_CLIENT_SECRET: str(),
    SMTP_HOST: str(),
    SMTP_PORT: port(),
    SMTP_USER: str(),
    SMTP_PASS: str(),
    EMAIL_FROM: email(),
  });
};

export default validateEnv;