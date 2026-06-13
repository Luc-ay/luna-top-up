import { ErrorRequestHandler, Response } from 'express'
import AppError from '../shared/appError'
import { BAD_REQUEST, INTERNAL_SERVER_ERROR } from '../shared/http'
import { ZodError } from 'zod'

const handleZodError = (res: Response, error: ZodError) => {
	// 1. Grab the very first issue
	const issue = error.issues[0]

	// 2. Format it cleanly
	const message = issue
		? `${issue.path.length > 0 ? issue.path.join('.') : 'Request'}: ${issue.message}`
		: 'Validation error'

	// 3. Return it as a proper JSON object
	return res.status(400).json({
		message,
	})
}

const errorHandler: ErrorRequestHandler = (error, req, res, next) => {
	if (error instanceof AppError) {
		return res.status(error.statusCode).json({ message: error.message })
	}

	if (error instanceof ZodError) {
		return handleZodError(res, error)
	}

	return res
		.status(INTERNAL_SERVER_ERROR)
		.json({ message: 'Internal Server Error', error: error.message })
}

export default errorHandler
