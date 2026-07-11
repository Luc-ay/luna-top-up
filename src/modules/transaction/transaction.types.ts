import z from 'zod'

export const GetTransactionsQuerySchema = z.object({
	page: z.string().optional().transform(val => (val ? parseInt(val, 10) : 1)),
	limit: z.string().optional().transform(val => (val ? parseInt(val, 10) : 10)),
	status: z.string().optional(),
	type: z.string().optional(),
})

export type GetTransactionsQuery = z.infer<typeof GetTransactionsQuerySchema>
