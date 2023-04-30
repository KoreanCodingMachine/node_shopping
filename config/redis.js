import redis from 'redis'
import dotenv from 'dotenv'

dotenv.config()

const { REDIS_HOST, REDIS_USERNAME, REDIS_PASSWORD, REDIS_PORT } = process.env

const redisClient = await redis.createClient({
    url: `redis://${REDIS_USERNAME}:${REDIS_PASSWORD}@${REDIS_HOST}:${REDIS_PORT}`,
    legacyMode: true
})

await redisClient.on('connect', () => {
    console.info('Redis connected!')
})

await redisClient.on('error', (err) => {
    console.error('Redis Client Error', err)
})

await redisClient.connect().then()
const redisCli = redisClient.v4

export default redisCli