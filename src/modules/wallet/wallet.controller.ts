import asyncHandler from '../../services/shared/catchError'
import { OK } from '../../services/shared/http'
import { getWalletService, transferWalletFundsService } from './wallet.service'
import { WalletTransferSchema } from './wallet.types'

export const getWalletController = asyncHandler(async (req, res) => {
	const userId = req.user?.id as string
	const result = await getWalletService(userId)

	return res.status(OK).json(result)
})

export const transferWalletFundsController = asyncHandler(async (req, res) => {
	const userId = req.user?.id as string
	const data = WalletTransferSchema.parse(req.body)
	const result = await transferWalletFundsService(data, userId)

	return res.status(OK).json(result)
})
