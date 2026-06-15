import { Router } from 'express'
import {
	forgetPasswordController,
	loginUserController,
	registerUserController,
	verifyOtpController,
} from './auth.controller'

const authRouter = Router()

authRouter.post('/register', registerUserController)
authRouter.post('/login', loginUserController)
authRouter.post('/password', forgetPasswordController)
authRouter.post('/verify', verifyOtpController)
export default authRouter
