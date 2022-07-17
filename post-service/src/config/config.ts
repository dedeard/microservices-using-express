import path from 'path'
import dotenv from 'dotenv'

dotenv.config({ path: path.join(__dirname, '../../.env') })

const config = {
  isProd: process.env.NODE_ENV === 'production',
  isDev: process.env.NODE_ENV === 'development',

  port: Number(process.env.PORT || 4000),
  mongodbUrl: process.env.MONGODB_URL || 'mongodb://localhost:27017/micro-posts',
  logging: process.env.LOGGING === 'true',

  jwtSecret: String(process.env.JWT_SECRET || 'access-secret'),

  redis: {
    host: String(process.env.REDIS_HOST || 'localhost'),
    port: Number(process.env.REDIS_PORT || 6379),
    pass: String(process.env.REDIS_PASS || ''),
  },

  cacheTtl: Number(process.env.CACHE_TTL || 30), // seconds

  authServiceBaseUrl: String(process.env.AUTH_SERVICE_BASE_URL || 'http://localhost:8081'),
}

export default config
