import AppError from '../../services/shared/appError'
import prisma from '../../config/db'
import { RegisterInput, RegisterResponse } from './auth.types'
import { CONFLICT } from '../../services/shared/http'
import bcrypt from 'bcrypt'

export async function registerService(
	data: RegisterInput,
): Promise<RegisterResponse> {
	const normalizedEmail = data.email.trim().toLowerCase()

	const checkUser = await prisma.user.findUnique({
		where: { email: normalizedEmail },
		select: { id: true },
	})

	if (checkUser) {
		throw new AppError(
			'User already exist with that email address',
			CONFLICT,
		)
	}

	const hashPassword = await bcrypt.hash(data.password, 10)

	const user = await prisma.user.create({
		data: {
			email: normalizedEmail,
			password: hashPassword,
			firstName: data.firstName,
			lastName: data.lastName,
			displayName: data.displayName,
		},
	})

	return { message: 'Registration Successful' }
}
