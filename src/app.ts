import express from 'express'
import cors from 'cors'
import morgan from 'morgan'
import dotenv from 'dotenv'
import helmet from 'helmet'
import rateLimit from 'express-rate-limit'
import errorHandler from './services/middleware/errorHandler'
import authRouter from './modules/auth/auth.route'
import userRouter from './modules/userProfile/user.route'
import { globalLimiter } from './config/rateLimiter'
import paymentRouter from './modules/payments/payment.route'
import vtuRouter from './modules/vtu/vtu.route'

dotenv.config()

const app = express()

// Middleware
app.set('trust proxy', 1)
app.use(morgan('dev'))
app.use(cors())
app.use(helmet())
app.use(express.json())
app.use(globalLimiter)

// Routes

app.get('/ping', (req, res) => {
	console.log('HELLO! I received a request!')
	res.send('Pong')
})
app.use('/api/auth', authRouter)
app.use('/api/user', userRouter)
app.use('/api/payment', paymentRouter)
app.use('/api/vtu', vtuRouter)

// Error Handler

app.use(errorHandler)

export default app
