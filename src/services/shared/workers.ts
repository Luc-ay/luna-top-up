import { Worker, Job } from 'bullmq'
import redisConnection from '../../config/redis'
// IMPORT YOUR EXISTING EMAIL SERVICE HERE
import { sendWelcomeEmail } from '../../services/shared/emailService'

export const emailWorker = new Worker(
	'email-queue', // Must match the queue name exactly
	async (job: Job) => {
		console.log('Connecting to Worker')
		// 1. Extract the data the controller dropped in the mailbox
		const { email, name } = job.data

		console.log(
			`[Worker] Picked up job ${job.id}. Sending email to ${email}...`,
		)

		console.log('Sending Welcome EMail Here')
		// 2. Call your existing asynchronous email function!
		await sendWelcomeEmail(email, name)

		console.log(`[Worker] Job ${job.id} completed!`)
	},
	{ connection: redisConnection as any },
)

emailWorker.on('failed', (job, err) => {
	console.error(`[Worker] Job failed: ${err.message}`)
})
