import { Queue } from 'bullmq'
import redisConnection from '../../config/redis'

// 1. Create the Queue
export const emailQueue = new Queue('email-queue', {
	connection: redisConnection as any,
})

// Helper: Dispatch welcome email
export const dispatchEmailJob = async (email: string, name: string) => {
	console.log('Called Welcome Email Queue')
	await emailQueue.add(
		'send-welcome-email',
		{ email, name },
		{ attempts: 3, removeOnComplete: true }
	)
}

// Helper: Dispatch deposit confirmation email
export const dispatchDepositEmail = async (email: string, amount: number, reference: string) => {
	console.log('Called Deposit Email Queue')
	await emailQueue.add(
		'send-deposit-email',
		{ email, amount, reference },
		{ attempts: 3, removeOnComplete: true }
	)
}

// Helper: Dispatch VTU purchase confirmation email
export const dispatchPurchaseEmail = async (
	email: string,
	serviceType: string,
	phoneNumber: string,
	amount: number,
	reference: string
) => {
	console.log('Called Purchase Email Queue')
	await emailQueue.add(
		'send-purchase-email',
		{ email, serviceType, phoneNumber, amount, reference },
		{ attempts: 3, removeOnComplete: true }
	)
}

// Helper: Dispatch refund/failed purchase email
export const dispatchRefundEmail = async (
	email: string,
	serviceType: string,
	phoneNumber: string,
	amount: number,
	reference: string,
	reason?: string
) => {
	console.log('Called Refund Email Queue')
	await emailQueue.add(
		'send-refund-email',
		{ email, serviceType, phoneNumber, amount, reference, reason },
		{ attempts: 3, removeOnComplete: true }
	)
}
