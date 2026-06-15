import { Router } from 'express'
import {
	changePasswordController,
	forgetPasswordController,
	loginUserController,
	registerUserController,
	verifyOtpController,
} from './auth.controller'
import { changePasswordAuth } from '../../services/middleware/auth.middleware'

const authRouter = Router()

authRouter.post('/register', registerUserController)
authRouter.post('/login', loginUserController)
authRouter.post('/password', forgetPasswordController)
authRouter.post('/verify', verifyOtpController)
authRouter.post('/changePassword', changePasswordAuth, changePasswordController)
export default authRouter
