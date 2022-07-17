import path from 'path'
import dotenv from 'dotenv'

dotenv.config({ path: path.join(__dirname, '../../.env') })

const config = {
  isProd: process.env.NODE_ENV === 'production',
  isDev: process.env.NODE_ENV === 'development',

  port: Number(process.env.PORT || 4000),
  mongodbUrl: process.env.MONGODB_URL || 'mongodb://localhost:27017/micro-auth',
  logging: process.env.LOGGING === 'true',

  jwt: {
    access: {
      secret: String(process.env.JWT_ACCESS_SECRET || 'access-secret'),
      expMinutes: Number(process.env.JWT_ACCESS_EXP_MINUTES || 30),
    },
    refresh: {
      secret: String(process.env.JWT_REFRESH_SECRET || 'refresh-secret'),
      expDays: Number(process.env.JWT_REFRESH_EXP_DAYS || 30),
    },
  },

  resetPasswordExpMinutes: Number(process.env.RESET_PASSWORD_EXP_MINUTES || 10),

  redis: {
    host: String(process.env.REDIS_HOST || 'localhost'),
    port: Number(process.env.REDIS_PORT || 6379),
    pass: String(process.env.REDIS_PASS || ''),
  },

  cacheTtl: Number(process.env.CACHE_TTL || 30), // seconds
}

export default config
