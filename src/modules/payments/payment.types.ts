import z from 'zod'

export const InitPaymentSchema = z.object({
	amount: z
		.number('Amount is required')
		.min(100, 'Minimum amount is ₦100 ')
		.max(100000, 'Maximum deposit is ₦100,000'),
})

export type InitPaymentInput = z.infer<typeof InitPaymentSchema>
export type FlutterwavePayload = {
	tx_ref: string
	id: string | number
	status?: string
	amount: number
	[key: string]: any
}

export type PaymentResponse = {
	paymentUrl: string
	reference: string
}
