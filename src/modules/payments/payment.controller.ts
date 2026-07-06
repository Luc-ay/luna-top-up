import { FLW_WEBHOOK_SECRET } from '../../config/env'
import asyncHandler from '../../services/shared/catchError'
import { CREATED } from '../../services/shared/http'
import { handleFlutterwaveWebhook, initDepositService } from './payment.service'
import { InitPaymentSchema } from './payment.types'

export const initDepositController = asyncHandler(async (req, res) => {
	const userId = req.user?.id
	const data = InitPaymentSchema.parse(req.body)

	const result = await initDepositService(data, userId)

	return res.status(CREATED).json(result)
})

export const flutterwaveWebhook = asyncHandler(async (req, res) => {
	const signature = req.headers['verif-hash']

	if (!signature || signature !== FLW_WEBHOOK_SECRET) {
		return res.sendStatus(401)
	}

	const payload = req.body.data

	await handleFlutterwaveWebhook(payload)

	return res.sendStatus(200)
})
