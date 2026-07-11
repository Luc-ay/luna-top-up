import z from 'zod'

export const PurchaseVtuSchema = z.object({
	flwId: z.number({ message: 'flwId is required' }),
	itemCode: z.string().optional(),
	amount: z
		.number({ message: 'Amount is required' })
		.min(50, 'Minimum purchase amount is ₦50'),
	phoneNumber: z
		.string({ message: 'Phone number is required' })
		.min(10, 'Invalid phone number'),
	transactionPin: z
		.string({ message: 'Transaction PIN is required' })
		.min(4, 'Transaction PIN must be at least 4 digits'),
})

export type PurchaseVtuInput = z.infer<typeof PurchaseVtuSchema>
