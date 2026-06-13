import z from 'zod'

export const RegisterSchema = z.object({
	email: z.email('Email is required'),
	password: z
		.string({ message: 'Password must be at least 8 characters long' })
		.min(8)
		.regex(
			/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/,
			{
				message:
					'Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character',
			},
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

export type RegisterInput = z.infer<typeof RegisterSchema>
export type LoginInput = z.infer<typeof LoginSchema>

// Registration response type

export type RegisterResponse = {
	message: string
}

export type LoginResponse = {
	message: string
	accessToken: string
}
