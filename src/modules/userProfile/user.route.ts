import { Router } from 'express'
import {
	changeUserPasswordController,
	getUserController,
	updateUserController,
} from './user.controller'
import { authenticateUser } from '../../services/middleware/auth.middleware'

const userRouter = Router()

userRouter.get('/', authenticateUser, getUserController)
userRouter.patch('/', authenticateUser, updateUserController)
userRouter.patch('/', authenticateUser, changeUserPasswordController)

export default userRouter
