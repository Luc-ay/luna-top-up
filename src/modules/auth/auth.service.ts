import AppError from '../../services/shared/appError'
import prisma from '../../config/db'
import {
	LoginInput,
	LoginResponse,
	PasswordInput,
	RegisterInput,
	RegisterResponse,
	VerifyOtpInput,
} from './auth.types'
import { BAD_REQUEST, CONFLICT, NOT_FOUND } from '../../services/shared/http'
import bcrypt from 'bcrypt'
import { generateToken, OtpToken } from '../../services/shared/token'
import { dispatchEmailJob } from '../../services/shared/queues'
import redisConnection from '../../config/redis'
import { resetPasswordCode } from '../../services/shared/emailService'

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

	const newUser = await prisma.$transaction(async (tx) => {
		const user = await tx.user.create({
			data: {
				email: normalizedEmail,
				password: hashPassword,
				firstName: data.firstName,
				lastName: data.lastName,
				displayName: normalizedDisplayName,
			},
		})

		const wallet = await tx.account.create({
			data: {
				userId: user.id,
				name: 'Main wallet',
			},
		})
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
			accounts: {
				select: {
					id: true,
					name: true,
					account_type: true,
					balance: true,
				},
			},
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

	console.log('Check redis and deleted for active token')
	await redisConnection.del(`access:${user.id}`)
	console.log('Save active token to redis')
	await redisConnection.setex(`access:${user.id},`, 86400, accessToken)

	return {
		message: 'User Login Successfully',
		accessToken,
		user,
	}
}

export async function forgetPasswordService(data: PasswordInput): Promise<any> {
	const normalizedEmail = data.email.trim().toLowerCase()
	const checkUser = await prisma.user.findUnique({
		where: { email: normalizedEmail },
		select: {
			id: true,
		},
	})

	if (!checkUser) {
		throw new AppError('User not found', NOT_FOUND)
	}

	const otp = await Math.floor(Math.random() * 1000000)
		.toString()
		.padStart(6, '0')

	await redisConnection.setex(`otp:${normalizedEmail}`, 600, otp)
	await resetPasswordCode(normalizedEmail, otp)

	return 'OTP sent successfully'
}

export async function verifyOtpService(data: VerifyOtpInput) {
	const verify = await redisConnection.get(`otp:${data.email}`)

	if (!verify) {
		throw new AppError('OTP has expired or does not exist', CONFLICT)
	}

	if (verify !== data.code) {
		throw new AppError('Invalid OTP Code', BAD_REQUEST)
	}

	console.log('Redis verified and moved on')

	const token = await OtpToken({ email: data.email, code: data.code })

	await redisConnection.del(`otp:${data.email}`)

	return { message: 'Verification Successful', token }
}

export async function changePasswordService(data: any) {}
