import z from 'zod'

export const UpdateUserSchema = z.object({
	firstName: z.string().optional(),
	lastName: z.string().optional(),
	displayName: z.string().trim().toLowerCase().optional(),
	phone: z
		.string()
		.trim() // 💡 Pro-tip: Move trim() up here!
		.regex(/^\d+$/, 'Phone number must contain only numbers')
		.min(10, 'Phone number must be at least 10 digits')
		.max(11, 'Phone number cannot be more than 11 digits')
		.optional(),
})

export const UpdatePasswordSchema = z.object({
	oldPassword: z
		.string('Old password is required')
		.min(8, 'Password must be 8 digits'),
	newPassword: z
		.string('Password is required')
		.min(8, 'Password must be at least 8 characters long')
		.regex(
			/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&]).{8,}$/,
			'Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character',
		),
})

export type updateUserInput = z.infer<typeof UpdateUserSchema>
export type UpdatePasswordInput = z.infer<typeof UpdatePasswordSchema>
