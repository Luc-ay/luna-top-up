import prisma from '../../config/db'
import bcrypt from 'bcrypt'
import AppError from '../../services/shared/appError'
import {
	OK,
	CONFLICT,
	NOT_FOUND,
	UNAUTHORIZED,
} from '../../services/shared/http'
import { UpdatePasswordInput, updateUserInput } from './user.types'
import { Prisma } from '@prisma/client'

export async function updateUserService(data: updateUserInput, userId: string) {
	try {
		const updatedUser = await prisma.user.update({
			where: { id: userId },
			data: {
				firstName: data.firstName,
				lastName: data.lastName,
				phone: data.phone,
				displayName: data.displayName
					? data.displayName.trim().toLowerCase()
					: undefined,
			},
			select: {
				id: true,
				firstName: true,
				lastName: true,
				email: true,
				displayName: true,
				phone: true,
				role: true,
				tier: true,
			},
		})

		return updatedUser
	} catch (error) {
		if (error instanceof Prisma.PrismaClientKnownRequestError) {
			if (error.code === 'P2025') {
				throw new AppError('User not found', 404)
			}

			if (error.code === 'P2002') {
				const target = error.meta?.target

				if (Array.isArray(target)) {
					if (target.includes('displayName')) {
						throw new AppError(
							'That display name is already taken, please choose another',
							409,
						)
					}

					if (target.includes('phone')) {
						throw new AppError(
							'That phone number is already registered to another user',
							409,
						)
					}
					if (target.includes('email')) {
						throw new AppError(
							'A user already exists with that email address',
							409,
						)
					}
				}
			}
		}

		throw error
	}
}

export async function changeUserPasswordService(
	data: UpdatePasswordInput,
	userId: string,
) {
	const userInfo = await prisma.user.findUnique({
		where: { id: userId },
		select: { id: true, email: true, password: true },
	})

	if (!userInfo) {
		throw new AppError(
			'Unauthorized to access this profile',
			UNAUTHORIZED,
		)
	}

	const comparePwd = await bcrypt.compare(
		data.oldPassword,
		userInfo.password,
	)
	if (!comparePwd) {
		throw new AppError('current password is Incorrect', CONFLICT)
	}

	const hashed = await bcrypt.hash(data.newPassword, 10)

	await prisma.user.update({
		where: { id: userId },
		data: { password: hashed },
	})

	return 'Password updated successfully'
}

export async function getUserService(userId: string) {
	const userInfo = await prisma.user.findUnique({
		where: { id: userId },
		select: {
			id: true,
			firstName: true,
			lastName: true,
			email: true,
			displayName: true,
			phone: true,
			role: true,
			tier: true,
		},
	})

	if (!userInfo) {
		throw new AppError(
			'Unauthorized to access this profile',
			UNAUTHORIZED,
		)
	}

	return userInfo
}
