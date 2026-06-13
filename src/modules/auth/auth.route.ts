import { Router } from 'express'
import { registerUserController } from './auth.controller'

const authRouter = Router()

authRouter.post('/register', registerUserController)

export default authRouter
