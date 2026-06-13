import express from 'express'
import cors from 'cors'
import morgan from 'morgan'
import dotenv from 'dotenv'
import helmet from 'helmet'
import errorHandler from './services/middleware/errorHandler'
import authRouter from './modules/auth/auth.route'

dotenv.config()

const app = express()

// Middleware
app.use(cors())
app.use(morgan('dev'))
app.use(helmet())
app.use(express.json())

// Routes
app.use('/api/auth', authRouter)
// Error Handler

app.use(errorHandler)

export default app
