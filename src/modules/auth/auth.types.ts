import z from 'zod'

export const RegisterSchema = z.object({
	email: z.email('Email is required'),
	password: z
		.string('Password is required')
		.min(8, 'Password must be at least 8 characters long')
		.regex(
			/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&]).{8,}$/,
			'Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character',
		),
	displayName: z
		.string('Display name is required')
		.min(3, 'Display name must be at least 3 characters long'),
	firstName: z
		.string('First name is required')
		.min(3, 'First name must be at least 3 characters long'),
	lastName: z
		.string('Last name is required')
		.min(3, 'Last name must be at least 3 characters long'),
})

export const LoginSchema = z.object({
	email: z.email('Email is required'),
	password: z.string('Password is required'),
})

export const PasswordSchema = z.object({
	email: z.email('Email is required'),
})

export const VerifyOtpSchema = z.object({
	code: z
		.string('OTP code us required')
		.min(6, 'Invalid code')
		.max(6, 'Invalid code'),
	email: z.email('Email is required').trim().toLowerCase(),
})

export const ChangePasswordSchema = z.object({
	email: z.email().optional(),
	newPassword: z
		.string('Password is required')
		.min(8, 'Password must be at least 8 characters long')
		.regex(
			/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&]).{8,}$/,
			'Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character',
		),
})

export type RegisterInput = z.infer<typeof RegisterSchema>
export type LoginInput = z.infer<typeof LoginSchema>
export type PasswordInput = z.infer<typeof PasswordSchema>
export type VerifyOtpInput = z.infer<typeof VerifyOtpSchema>
export type ChangePasswordInput = z.infer<typeof ChangePasswordSchema>

// Registration response type

export type RegisterResponse = {
	message: string
}

export type PasswordResponse = {
	message: string
}

export type LoginResponse = {
	message: string
	accessToken: string
	user: {}
}
