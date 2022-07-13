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

  pusher: {
    appId: String(process.env.PUSHER_APP_ID),
    key: String(process.env.PUSHER_APP_KEY),
    secret: String(process.env.PUSHER_APP_SECRET),
    cluster: String(process.env.PUSHER_APP_CLUSTER),
    disableStats: true,
  },

  algolia: {
    appId: String(process.env.ALGOLIA_APP_ID),
    apiKey: String(process.env.ALGOLIA_API_KEY),
    indexName: String(process.env.ALGOLIA_INDEX_NAME || 'micro-posts'),
  },
}

export default config
