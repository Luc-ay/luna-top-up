import { Router } from 'express'
import { loginUserController, registerUserController } from './auth.controller'

const authRouter = Router()

authRouter.post('/register', registerUserController)
authRouter.post('/login', loginUserController)

export default authRouter
