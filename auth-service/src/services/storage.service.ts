import { SaveOptions, Storage } from '@google-cloud/storage'
import config from '@/config/config'

const storage = new Storage({
  credentials: config.googleCLoudKey,
  projectId: config.googleCLoudKey.project_id,
})
const bucket = storage.bucket(String(config.bucketName))

export async function save(name: string, data: string | Buffer, option?: SaveOptions): Promise<void> {
  await bucket.file(name).save(data, option || { contentType: 'image/jpeg' })
  await bucket.file(name).makePublic()
}

export async function remove(name: string): Promise<boolean> {
  return !!(await bucket.file(name).delete())
}

export async function exists(name: string): Promise<boolean> {
  return !!(await bucket.file(name).exists())
}

export function createUrl(name: string): string {
  return `https://storage.googleapis.com/${bucket.name}/${name}`
}

export function normalizeUrl(url: string): string {
  return url.replace(`https://storage.googleapis.com/${bucket.name}/`, '')
}

export default {
  save,
  remove,
  exists,
  createUrl,
  normalizeUrl,
}
