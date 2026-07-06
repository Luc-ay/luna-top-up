import AppError from '../../services/shared/appError'
import prisma from '../../config/db'
import { flwClient } from '../../config/flutterwave'
import {
	FlutterwavePayload,
	InitPaymentInput,
	PaymentResponse,
} from './payment.types'
import { CONFLICT, NOT_FOUND } from '../../services/shared/http'
import {
	isWebhookProcessed,
	logWebhookPending,
	markWebhookFailed,
	markWebhookProcessed,
} from '../../services/shared/webhookIdempotency'
import { PaymentStatus } from '@prisma/client'

// const reference = `Luna-${Date.now()}-${Math.floor(100000 + Math.random() * 900000)}`

export async function initDepositService(
	data: InitPaymentInput,
	userId: string,
): Promise<PaymentResponse> {
	const account = await prisma.account.findFirst({
		where: { userId },
		include: { user: true },
	})

	if (!account) throw new AppError('Wallet not found', 404)

	// Using Date.now() alongside random numbers guarantees the reference is 100% unique
	const reference = `Luna-${Date.now()}-${Math.floor(1000 + Math.random() * 9000)}`

	// 1. Create BOTH the Transaction and the Payment atomically
	await prisma.$transaction(async (tx) => {
		const transaction = await tx.transaction.create({
			data: {
				userId,
				amount: data.amount,
				type: 'WALLET_FUND',
				status: 'PENDING',
			},
		})

		await tx.payment.create({
			data: {
				userId,
				amount: data.amount,
				reference,
				transactionId: transaction.id,
				status: 'PENDING',
			},
		})
	})

	const checkout = await flwClient.post('/payments', {
		tx_ref: reference,
		amount: data.amount,
		currency: 'NGN',
		redirect_url: 'https://yourdomain.com/payment/callback',
		customer: {
			email: account.user?.email,
			name: `${account.user?.firstName || ''} ${account.user?.lastName || ''}`.trim(),
		},
		customizations: {
			title: 'Luna Wallet Top Up',
		},
	})

	return {
		paymentUrl: checkout.data.data.link,
		reference,
	}
}

export interface WebhookResponse {
	status: string
}

export async function handleFlutterwaveWebhook(
	payload: any | null | undefined,
) {
	if (!payload) return { status: 'ignored' }

	const tx_ref = payload.tx_ref
	const externalId = String(payload.id) // Flutterwave transaction ID

	const alreadyProcessed = await isWebhookProcessed(
		'flutterwave',
		externalId,
	)
	if (alreadyProcessed) {
		console.log('Webhook already processed:', externalId)
		return { status: 'already_processed' }
	}

	await logWebhookPending('flutterwave', externalId, payload)

	const status = payload.status?.toLowerCase()
	if (!status || !['successful', 'completed', 'success'].includes(status)) {
		console.log('Webhook ignored - status not successful:', status)
		return { status: 'ignored' }
	}

	const existingPayment = await prisma.payment.findUnique({
		where: { reference: tx_ref },
		select: {
			id: true,
			status: true,
			userId: true,
			amount: true,
			transactionId: true,
		},
	})

	if (existingPayment?.status === PaymentStatus.SUCCESS)
		return { status: 'already_processed' }

	if (!existingPayment) {
		console.error('Payment not found:', tx_ref)
		await markWebhookFailed(
			'flutterwave',
			externalId,
			'Payment not found',
		)
		return { status: 'not_found' }
	}

	await prisma.$transaction(async (tx) => {
		const systemGatewayAccount = await tx.account.findFirst({
			where: {
				name: 'Gateway_Flutterwave',
				userId: null,
			},
		})

		const userWalletAccount = await tx.account.findFirst({
			where: {
				userId: existingPayment.userId,
				name: 'Main Wallet',
			},
		})

		if (!systemGatewayAccount || !userWalletAccount) {
			throw new Error(
				'Required accounting structures are missing from the database.',
			)
		}

		await tx.payment.update({
			where: { id: existingPayment.id },
			data: {
				status: PaymentStatus.SUCCESS,
				providerRef: externalId,
			},
		})

		if (existingPayment.transactionId) {
			const updatedTx = await tx.transaction.update({
				where: { id: existingPayment.transactionId },
				data: { status: 'SUCCESS' },
			})

			await tx.ledgerEntry.create({
				data: {
					amount: existingPayment.amount,
					description: `Wallet funded via Flutterwave (Ref: ${tx_ref})`,
					transactionId: updatedTx.id,
					sourceAccountId: systemGatewayAccount.id, // <-- Dynamic ID
					destAccountId: userWalletAccount.id, // <-- Dynamic ID
				},
			})

			await tx.account.update({
				where: { id: systemGatewayAccount.id },
				data: {
					balance: {
						decrement: existingPayment.amount,
					},
				},
			})

			await tx.account.update({
				where: { id: userWalletAccount.id },
				data: {
					balance: {
						increment: existingPayment.amount,
					},
				},
			})
		}
	})

	await markWebhookProcessed('flutterwave', externalId)

	console.log('Payment successfully processed:', tx_ref)
	return { status: 'processed' }
}
