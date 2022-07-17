import cacheManager from 'cache-manager'
import redisStore from 'cache-manager-redis-store'
import config from './config'
import logger from './logger'

const redisCache = cacheManager.caching({
  store: redisStore,
  host: config.redis.host,
  port: config.redis.port,
  auth_pass: config.redis.pass,
  ttl: config.cacheTtl, // seconds
})

const redisClient = redisCache.store.getClient()

redisClient.on('error', (error: Error) => {
  logger.error('[REDIS] Error: ' + JSON.stringify(error))
})

export default redisCache
