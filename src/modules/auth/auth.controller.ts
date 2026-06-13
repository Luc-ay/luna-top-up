import { Request, Response } from 'express'
import AppError from '../../services/shared/appError'
import asyncHandler from '../../services/shared/catchError'
import { LoginSchema, RegisterSchema } from './auth.types'
import { loginService, registerService } from './auth.service'
import { CREATED, OK } from './../../services/shared/http'

export const registerUserController = asyncHandler(async (req, res) => {
	const data = RegisterSchema.parse(req.body)
	const result = await registerService(data)
	return res.status(CREATED).json(result)
})

export const loginUserController = asyncHandler(async (req, res) => {
	const data = LoginSchema.parse(req.body)
	const result = await loginService(data)

	return res.status(OK).json(result)
})
