import { Router } from 'express'
import { authenticateUser } from '../../services/middleware/auth.middleware'
import { initDepositController } from './payment.controller'

const paymentRouter = Router()

paymentRouter.post('/init', authenticateUser, initDepositController)

export default paymentRouter
