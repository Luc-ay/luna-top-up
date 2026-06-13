import { Request, Response } from 'express'
import AppError from '../../services/shared/appError'
import asyncHandler from '../../services/shared/catchError'
import { RegisterSchema } from './auth.types'
import { registerService } from './auth.service'
import { OK } from './../../services/shared/http'

export const registerUserController = asyncHandler(async (req, res) => {
	const data = RegisterSchema.parse(req.body)
	const result = await registerService(data)
	return res.status(OK).json(result)
})
