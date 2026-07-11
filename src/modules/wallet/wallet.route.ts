import { Router } from 'express'
import { authenticateUser } from '../../services/middleware/auth.middleware'
import { getWalletController, transferWalletFundsController } from './wallet.controller'

const walletRouter = Router()

walletRouter.get('/', authenticateUser, getWalletController)
walletRouter.post('/transfer', authenticateUser, transferWalletFundsController)

export default walletRouter
