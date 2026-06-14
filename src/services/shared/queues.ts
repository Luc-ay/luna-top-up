import { Queue } from 'bullmq'
import redisConnection from '../../config/redis'

// 1. Create the Queue
export const emailQueue = new Queue('email-queue', {
	connection: redisConnection as any,
})

// 2. Create a helper function for your controller to use
export const dispatchEmailJob = async (email: string, name: string) => {
	// Add the job to Redis
	console.log('Called Email Que')
	await emailQueue.add(
		'send-welcome-email', // Name of the job
		{ email, name }, // The payload (data) needed to send the email
		{
			attempts: 3, // Retry 3 times if it fails
			removeOnComplete: true, // Keep RAM clean!
		},
	)
}
