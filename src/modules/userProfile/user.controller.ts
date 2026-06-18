import asyncHandler from '../../services/shared/catchError'
import { OK } from '../../services/shared/http'
import {
	changeUserPasswordService,
	getUserService,
	updateUserService,
} from './user.service'
import { UpdatePasswordSchema, UpdateUserSchema } from './user.types'

export const updateUserController = asyncHandler(async (req, res) => {
	const userId = req.user?.id
	const data = UpdateUserSchema.parse(req.body)
	const result = await updateUserService(data, userId)

	return res.status(OK).json(result)
})

export const changeUserPasswordController = asyncHandler(async (req, res) => {
	const userId = req.user?.id
	const data = UpdatePasswordSchema.parse(req.body)
	const result = changeUserPasswordService(data, userId)

	return res.status(OK).json(result)
})

export const getUserController = asyncHandler(async (req, res) => {
	const userId = req.user?.id
	const result = getUserService(userId)

	return res.status(OK).json(result)
})
