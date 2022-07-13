import path from 'path'
import dotenv from 'dotenv'

dotenv.config({ path: path.join(__dirname, '../../.env') })

const config = {
  isProd: process.env.NODE_ENV === 'production',
  isDev: process.env.NODE_ENV === 'development',

  port: Number(process.env.PORT || 4000),
  mongodbUrl: process.env.MONGODB_URL || 'mongodb://localhost:27017/micro-comments',
  logging: process.env.LOGGING === 'true',

  jwtSecret: String(process.env.JWT_SECRET),

  redis: {
    host: String(process.env.REDIS_HOST),
    port: Number(process.env.REDIS_PORT),
    pass: String(process.env.REDIS_PASS),
  },
}

export default config
