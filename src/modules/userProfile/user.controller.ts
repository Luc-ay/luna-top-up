import asyncHandler from '../../services/shared/catchError'
import { OK } from '../../services/shared/http'
import {
	changeUserPasswordService,
	createUserPinService,
	getUserService,
	updateUserService,
} from './user.service'
import { CreatePinSchema, UpdatePasswordSchema, UpdateUserSchema } from './user.types'

export const updateUserController = asyncHandler(async (req, res) => {
	const userId = req.user?.id
	const data = UpdateUserSchema.parse(req.body)
	const result = await updateUserService(data, userId)

	return res.status(OK).json(result)
})

export const changeUserPasswordController = asyncHandler(async (req, res) => {
	const userId = req.user?.id
	const data = UpdatePasswordSchema.parse(req.body)
	const result = await changeUserPasswordService(data, userId)

	return res.status(OK).json(result)
})

export const getUserController = asyncHandler(async (req, res) => {
	const userId = req.user?.id
	const result = await getUserService(userId)

	return res.status(OK).json(result)
})

export const createUserPinController = asyncHandler(async (req, res) => {
	const userId = req.user?.id
	const data = CreatePinSchema.parse(req.body)
	const result = await createUserPinService(data, userId)

	return res.status(OK).json(result)
})
