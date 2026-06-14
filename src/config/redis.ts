import { Redis } from 'ioredis'
import dotenv from 'dotenv'
import { REDIS_URL } from './env'

dotenv.config()

// Connect to your local Redis or Render Redis URL
console.log('Connecting to Redis')
const redisConnection = new Redis(REDIS_URL as string, {
	maxRetriesPerRequest: null, // Required by BullMQ
})

redisConnection.on('error', (err) => {
	console.error('Redis connection error:', err)
})

export default redisConnection
