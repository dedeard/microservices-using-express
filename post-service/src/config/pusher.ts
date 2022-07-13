import Pusher from 'pusher'
import config from './config'

const pusher = new Pusher(config.pusher)

export default pusher
