import { Router } from 'express'
import { authenticateUser } from '../../services/middleware/auth.middleware'
import {
	getTransactionByIdController,
	getUserTransactionsController,
} from './transaction.controller'

const transactionRouter = Router()

transactionRouter.get('/', authenticateUser, getUserTransactionsController)
transactionRouter.get('/:id', authenticateUser, getTransactionByIdController)

export default transactionRouter
