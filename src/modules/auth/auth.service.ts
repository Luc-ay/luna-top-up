import AppError from '../../services/shared/appError'
import prisma from '../../config/db'
import {
	LoginInput,
	LoginResponse,
	RegisterInput,
	RegisterResponse,
} from './auth.types'
import { CONFLICT, NOT_FOUND } from '../../services/shared/http'
import bcrypt from 'bcrypt'
import { generateToken } from '../../services/shared/token'
import { dispatchEmailJob } from '../../services/shared/queues'

export async function registerService(
	data: RegisterInput,
): Promise<RegisterResponse> {
	const normalizedEmail = data.email.trim().toLowerCase()
	const normalizedDisplayName = data.displayName.trim().toLowerCase()

	console.log('Checking this thing here')

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
			displayName: normalizedDisplayName,
		},
	})

	console.log('Sending Worker que')
	dispatchEmailJob(normalizedEmail, `${data.firstName} ${data.lastName}`)

	return { message: 'Registration Successful' }
}

export async function loginService(data: LoginInput): Promise<LoginResponse> {
	const normalizedEmail = data.email.trim().toLowerCase()

	const user = await prisma.user.findUnique({
		where: { email: normalizedEmail },
		select: {
			id: true,
			email: true,
			password: true,
			role: true,
			firstName: true,
		},
	})

	if (!user) {
		throw new AppError('Invalid credentials', NOT_FOUND)
	}

	const comparePassword = await bcrypt.compare(data.password, user.password)
	if (!comparePassword) {
		throw new AppError('Invalid credentials', NOT_FOUND)
	}

	// generate tokens
	const accessToken = await generateToken({
		id: user.id,
		email: user.email,
		role: user.role,
	})

	return {
		message: 'User Login Successfully',
		accessToken,
	}
}
