import Queue from 'bee-queue'
import config from '@/config/config'
import logger from '@/config/logger'
import algoliasearch from 'algoliasearch'
import Post, { IPostDocument } from '@/models/post.model'

const index = algoliasearch(config.algolia.appId, config.algolia.apiKey).initIndex(config.algolia.indexName)

const updatePostsOnAlgolia = new Queue('update-posts-on-algolia', {
  redis: {
    port: config.redis.port,
    host: config.redis.host,
    auth_pass: config.redis.pass,
  },
})

export default updatePostsOnAlgolia

function transformPostToAlgoliaObject(post: IPostDocument) {
  const data = post.toJSON()
  return {
    objectID: data.id,
    userId: data.user,
    title: data.title,
    slug: data.slug,
    description: data.description,
    body: data.body,
    tags: data.tags,
    heroImage: data.heroImage,
    createdAt: data.createdAt,
    updatedAt: data.updatedAt,
  }
}

updatePostsOnAlgolia.process(async (job) => {
  const { action, postId } = job.data
  try {
    if (action === 'publish') {
      const post = await Post.findById(postId)
      if (post) {
        await index.partialUpdateObject(transformPostToAlgoliaObject(post), { createIfNotExists: true })
      }
    } else {
      await index.deleteObject(postId)
    }
    logger.info(`[UPDATE POST ON ALGOLIA] Post ${postId} was ${action}d on Algolia`)
  } catch (e) {
    logger.error('[UPDATE POST ON ALGOLIA] ' + JSON.stringify(e))
  }
})
