import { Worker, Job } from 'bullmq'
import redisConnection from '../../config/redis'
import {
	sendWelcomeEmail,
	sendDepositEmail,
	sendPurchaseEmail,
	sendRefundEmail,
} from '../../services/shared/emailService'

export const emailWorker = new Worker(
	'email-queue',
	async (job: Job) => {
		console.log(`[Worker] Received job ${job.name} (ID: ${job.id})`)

		const data = job.data
		const email = data.email

		switch (job.name) {
			case 'send-welcome-email':
				console.log(`[Worker] Sending Welcome email to ${email}...`)
				await sendWelcomeEmail(email, data.name)
				break

			case 'send-deposit-email':
				console.log(`[Worker] Sending Deposit email to ${email}...`)
				await sendDepositEmail(email, Number(data.amount), data.reference)
				break

			case 'send-purchase-email':
				console.log(`[Worker] Sending Purchase email to ${email}...`)
				await sendPurchaseEmail(
					email,
					data.serviceType,
					data.phoneNumber,
					Number(data.amount),
					data.reference
				)
				break

			case 'send-refund-email':
				console.log(`[Worker] Sending Refund email to ${email}...`)
				await sendRefundEmail(
					email,
					data.serviceType,
					data.phoneNumber,
					Number(data.amount),
					data.reference,
					data.reason
				)
				break

			default:
				console.warn(`[Worker] Unknown job name: ${job.name}`)
		}

		console.log(`[Worker] Job ${job.name} (ID: ${job.id}) completed successfully!`)
	},
	{ connection: redisConnection as any },
)

emailWorker.on('failed', (job, err) => {
	console.error(`[Worker] Job failed: ${err.message}`)
})
