import mongoose from 'mongoose'
import config from './config'
import logger from './logger'

mongoose.connection.on('connected', () => {
  logger.info('[MONGO] connected')
})

mongoose.connection.on('disconnected', () => {
  logger.warn('[MONGO] disconnected')
})

mongoose.connection.on('reconnected', () => {
  logger.warn('[MONGO] reconnected')
})

export async function connect() {
  await mongoose.connect(String(config.mongodbUrl)).catch((err) => {
    logger.error('[MONGO] ' + err)
  })
}

export async function disconnect() {
  await mongoose.disconnect().catch((err) => {
    logger.error('[MONGO] ' + err)
  })
}
