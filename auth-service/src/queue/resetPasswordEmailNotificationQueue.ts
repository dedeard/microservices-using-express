import Queue from 'bee-queue'
import { createTransport } from 'nodemailer'
import config from '@/config/config'
import logger from '@/config/logger'

const resetPasswordEmailNotificationQueue = new Queue('reset-password-email-notification', {
  redis: {
    port: config.redis.port,
    host: config.redis.host,
    auth_pass: config.redis.pass,
  },
})

export default resetPasswordEmailNotificationQueue

resetPasswordEmailNotificationQueue.process(async (job) => {
  const { email, code } = job.data
  try {
    const info = await createTransport(config.smtp).sendMail({
      from: config.smtp.from,
      to: email,
      subject: 'Reset Password',
      html: `<h3>Hi, ${email}</h3> <p>You verification code is <strong>${code}</strong></p>`,
    })
    logger.info('[Reset password email]' + JSON.stringify(info))
  } catch (e) {
    logger.error('[Reset password email]' + JSON.stringify(e))
    throw e
  }
})
