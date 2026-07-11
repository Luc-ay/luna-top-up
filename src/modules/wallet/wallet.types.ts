import z from 'zod'

export const WalletTransferSchema = z.object({
	recipientEmail: z
		.string({ message: 'Recipient email is required' })
		.email('Invalid recipient email'),
	amount: z
		.number({ message: 'Amount is required' })
		.min(10, 'Minimum transfer amount is ₦10'),
	transactionPin: z.string({ message: 'Transaction PIN is required' }),
	description: z.string().optional(),
})

export type WalletTransferInput = z.infer<typeof WalletTransferSchema>
