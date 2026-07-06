import prisma from '../../config/db'
import { Prisma, WebhookStatus } from '@prisma/client'

export async function isWebhookProcessed(
	provider: string,
	externalId: string,
): Promise<boolean> {
	const log = await prisma.webhookLog.findFirst({
		where: {
			provider,
			externalId,
			status: WebhookStatus.PROCESSED,
		},
	})

	return !!log
}

export async function logWebhookPending(
	provider: string,
	externalId: string,
	payload: any,
) {
	try {
		const existingLog = await prisma.webhookLog.findFirst({
			where: {
				provider,
				externalId,
			},
		})

		if (existingLog) {
			return await prisma.webhookLog.update({
				where: { id: existingLog.id },
				data: {
					payload: payload, // Handles null payloads safely
					status: WebhookStatus.PENDING,
				},
			})
		}

		// 3. If it doesn't exist, create it
		return await prisma.webhookLog.create({
			data: {
				provider,
				externalId,
				payload: payload ?? null,
				status: WebhookStatus.PENDING,
			},
		})
	} catch (error) {
		// Handle Prisma duplicate key error (Equivalent to Mongo 11000)
		if (error instanceof Prisma.PrismaClientKnownRequestError) {
			if (error.code === 'P2002') {
				console.warn(
					`⚠️ Webhook already exists for ${provider}:${externalId}`,
				)
				return null
			}
		}

		throw error
	}
}

export async function markWebhookFailed(
	provider: string,
	externalId: string,
	error: any,
) {
	const existingLog = await prisma.webhookLog.findFirst({
		where: { provider, externalId },
	})

	if (!existingLog) {
		console.warn(
			`⚠️ Tried to mark webhook as failed, but no log was found for ${provider}:${externalId}`,
		)
		return null
	}

	return await prisma.webhookLog.update({
		where: { id: existingLog.id },
		data: {
			status: WebhookStatus.FAILED,
			error: error?.message || String(error),
		},
	})
}

export async function markWebhookProcessed(
	provider: string,
	externalId: string,
) {
	const existingLog = await prisma.webhookLog.findFirst({
		where: { provider, externalId },
	})

	if (!existingLog) {
		console.warn(
			`⚠️ Tried to mark webhook as processed, but no log was found for ${provider}:${externalId}`,
		)
		return null
	}

	return await prisma.webhookLog.update({
		where: { id: existingLog.id },
		data: {
			status: WebhookStatus.PROCESSED,
		},
	})
}
