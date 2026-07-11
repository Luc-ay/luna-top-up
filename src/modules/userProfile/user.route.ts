import { Router } from 'express'
import {
	changeUserPasswordController,
	createUserPinController,
	getUserController,
	updateUserController,
} from './user.controller'
import { authenticateUser } from '../../services/middleware/auth.middleware'

const userRouter = Router()

userRouter.get('/', authenticateUser, getUserController)
userRouter.patch('/', authenticateUser, updateUserController)
userRouter.patch('/password', authenticateUser, changeUserPasswordController)
userRouter.post('/pin', authenticateUser, createUserPinController)

export default userRouter
