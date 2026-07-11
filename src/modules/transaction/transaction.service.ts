import prisma from '../../config/db'
import AppError from '../../services/shared/appError'
import { NOT_FOUND, UNAUTHORIZED } from '../../services/shared/http'
import { GetTransactionsQuery } from './transaction.types'

export async function getUserTransactionsService(userId: string, query: GetTransactionsQuery) {
	const { page, limit, status, type } = query

	const skip = (page - 1) * limit
	const take = limit

	const whereClause: any = { userId }

	if (status) {
		whereClause.status = status.toUpperCase()
	}

	if (type) {
		whereClause.type = type.toUpperCase()
	}

	// Fetch transactions and total count in parallel
	const [transactions, total] = await Promise.all([
		prisma.transaction.findMany({
			where: whereClause,
			skip,
			take,
			orderBy: { createdAt: 'desc' },
			include: {
				ledgerEntries: {
					select: {
						amount: true,
						description: true,
						createdAt: true,
					},
				},
			},
		}),
		prisma.transaction.count({
			where: whereClause,
		}),
	])

	return {
		transactions,
		pagination: {
			total,
			page,
			limit,
			totalPages: Math.ceil(total / limit),
		},
	}
}

export async function getTransactionByIdService(
	transactionId: string,
	userId: string,
	userRole: string
) {
	const transaction = await prisma.transaction.findUnique({
		where: { id: transactionId },
		include: {
			ledgerEntries: {
				select: {
					amount: true,
					description: true,
					sourceAccount: {
						select: { name: true, account_type: true },
					},
					destAccount: {
						select: { name: true, account_type: true },
					},
					createdAt: true,
				},
			},
		},
	})

	if (!transaction) {
		throw new AppError('Transaction not found', NOT_FOUND)
	}

	// Verify ownership unless the requestor is an admin
	if (transaction.userId !== userId && userRole !== 'ADMIN') {
		throw new AppError('You are not authorized to view this transaction details', UNAUTHORIZED)
	}

	return transaction
}
