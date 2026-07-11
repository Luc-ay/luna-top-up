import { Router } from 'express'
import { authenticateUser } from '../../services/middleware/auth.middleware'
import { flutterwaveWebhook, initDepositController } from './payment.controller'

const paymentRouter = Router()

paymentRouter.post('/init', authenticateUser, initDepositController)
paymentRouter.post('/webhook', flutterwaveWebhook)

export default paymentRouter
