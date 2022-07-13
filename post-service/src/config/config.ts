import path from 'path'
import dotenv from 'dotenv'

dotenv.config({ path: path.join(__dirname, '../../.env') })

const config = {
  isProd: process.env.NODE_ENV === 'production',
  isDev: process.env.NODE_ENV === 'development',

  port: Number(process.env.PORT || 4000),
  mongodbUrl: process.env.MONGODB_URL || 'mongodb://localhost:27017/micro-posts',
  logging: process.env.LOGGING === 'true',

  jwtSecret: String(process.env.JWT_SECRET),

  redis: {
    host: String(process.env.REDIS_HOST),
    port: Number(process.env.REDIS_PORT),
    pass: String(process.env.REDIS_PASS),
  },

  bucketName: process.env.GC_BUCKET_NAME,
  googleCLoudKey: {
    project_id: process.env.GC_PROJECT_ID,
    private_key: String(process.env.GC_PRIVATE_KEY).replace(/\\n/g, '\n'),
    client_email: process.env.GC_CLIENT_EMAIL,
  },

  authServiceBaseUrl: String(process.env.AUTH_SERVICE_BASE_URL || 'http://localhost:8081'),
}

export default config
