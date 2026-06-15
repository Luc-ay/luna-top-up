import { Request, Response } from 'express'
import AppError from '../../services/shared/appError'
import asyncHandler from '../../services/shared/catchError'
import {
	ChangePasswordSchema,
	LoginSchema,
	PasswordSchema,
	RegisterSchema,
	VerifyOtpSchema,
} from './auth.types'
import {
	changePasswordService,
	forgetPasswordService,
	loginService,
	registerService,
	verifyOtpService,
} from './auth.service'
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

export const forgetPasswordController = asyncHandler(async (req, res) => {
	const data = PasswordSchema.parse(req.body)
	const result = await forgetPasswordService(data)

	return res.status(OK).json(result)
})

export const verifyOtpController = asyncHandler(async (req, res) => {
	const data = VerifyOtpSchema.parse(req.body)
	const result = await verifyOtpService(data)

	return res.status(OK).json(result)
})

export const changePasswordController = asyncHandler(async (req, res) => {
	const email = req.user!.email
	const data = ChangePasswordSchema.parse(req.body)
	const result = await changePasswordService({
		newPassword: data.newPassword,
		email: email,
	})

	return res.status(OK).json(result)
})
