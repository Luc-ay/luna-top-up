import { NextFunction, Request, Response } from 'express'
import { JwtPayload } from 'jsonwebtoken'
import jwt from 'jsonwebtoken'
import AppError from '../shared/appError'
import { verifyToken } from '../shared/token'
import redisConnection from '../../config/redis'

// Define exactly what is inside your JWT
export interface CustomJwtPayload extends JwtPayload {
	userId?: string
	email: string
	role?: string
	code?: string
}

// Tell TypeScript to merge this with the standard Express Request
declare global {
	namespace Express {
		interface Request {
			user?: CustomJwtPayload
		}
	}
}

export const authenticateUser = async (
	req: Request,
	res: Response,
	next: NextFunction,
) => {
	try {
		const authHeader = req.headers.authorization
		if (!authHeader || !authHeader.startsWith('Bearer ')) {
			throw new AppError(
				'You are not logged in. Please provide a valid token.',
				401,
			)
		}

		const token = authHeader.split(' ')[1]

		const decoded = verifyToken(token) as CustomJwtPayload

		const activeToken = await redisConnection.get(
			`access_token:${decoded.userId}`,
		)

		if (!activeToken) {
			throw new AppError(
				'Session expired. Please log in again.',
				401,
			)
		}

		if (activeToken !== token) {
			throw new AppError(
				'Token revoked. You logged in on another device.',
				401,
			)
		}

		req.user = decoded
		next()
	} catch (error) {
		if (error instanceof jwt.TokenExpiredError) {
			return next(
				new AppError(
					'Your token has expired. Please log in again.',
					401,
				),
			)
		}
		if (error instanceof jwt.JsonWebTokenError) {
			return next(
				new AppError(
					'Invalid token signature. Please log in again.',
					401,
				),
			)
		}

		next(error)
	}
}

export const changePasswordAuth = async (
	req: Request,
	res: Response,
	next: NextFunction,
) => {
	try {
		const authHeader = req.headers.authorization
		if (!authHeader || !authHeader.startsWith('Bearer ')) {
			throw new AppError(
				'You are not logged in. Please provide a valid token.',
				401,
			)
		}

		const token = authHeader.split(' ')[1]

		const decoded = verifyToken(token) as CustomJwtPayload

		const activeToken = await redisConnection.get(
			`password_token:${decoded.email}`,
		)

		if (!activeToken) {
			throw new AppError(
				'Session expired. Please request for otp again.',
				401,
			)
		}

		if (activeToken !== token) {
			throw new AppError(
				'Token revoked. You logged in on another device.',
				401,
			)
		}

		req.user = decoded
		next()
	} catch (error) {
		if (error instanceof jwt.TokenExpiredError) {
			return next(
				new AppError(
					'Your token has expired. Please log in again.',
					401,
				),
			)
		}
		if (error instanceof jwt.JsonWebTokenError) {
			return next(
				new AppError(
					'Invalid token signature. Please log in again.',
					401,
				),
			)
		}

		next(error)
	}
}
