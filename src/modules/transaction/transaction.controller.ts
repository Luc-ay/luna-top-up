import asyncHandler from '../../services/shared/catchError'
import { OK } from '../../services/shared/http'
import { getTransactionByIdService, getUserTransactionsService } from './transaction.service'
import { GetTransactionsQuerySchema } from './transaction.types'

export const getUserTransactionsController = asyncHandler(async (req, res) => {
	const userId = req.user?.id as string
	const query = GetTransactionsQuerySchema.parse(req.query)
	const result = await getUserTransactionsService(userId, query)

	return res.status(OK).json(result)
})

export const getTransactionByIdController = asyncHandler(async (req, res) => {
	const userId = req.user?.id as string
	const userRole = (req.user?.role || 'USER') as string
	const { id } = req.params

	const result = await getTransactionByIdService(id as string, userId, userRole)

	return res.status(OK).json(result)
})
