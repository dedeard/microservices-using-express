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
      secret: String(process.env.JWT_ACCESS_SECRET),
      expMinutes: Number(process.env.JWT_ACCESS_EXP_MINUTES),
    },
    refresh: {
      secret: String(process.env.JWT_REFRESH_SECRET),
      expDays: Number(process.env.JWT_REFRESH_EXP_DAYS),
    },
  },

  resetPasswordExpMinutes: Number(process.env.RESET_PASSWORD_EXP_MINUTES),

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

  smtp: {
    host: String(process.env.SMTP_HOST),
    port: Number(process.env.SMTP_PORT),
    from: process.env.SMTP_FROM,
    auth: {
      user: String(process.env.SMTP_USER),
      pass: String(process.env.SMTP_PASS),
    },
  },

  pusher: {
    appId: String(process.env.PUSHER_APP_ID),
    key: String(process.env.PUSHER_APP_KEY),
    secret: String(process.env.PUSHER_APP_SECRET),
    cluster: String(process.env.PUSHER_APP_CLUSTER),
    disableStats: true,
  },
}

export default config
