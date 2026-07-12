import rateLimit from 'express-rate-limit'

export const globalLimiter = rateLimit({
	windowMs: 15 * 60 * 1000,
	limit: 500,
	// Exempt payment webhook endpoint from rate limiting to prevent blocking payment gateway callbacks
	skip: (req) => req.originalUrl === '/api/payment/webhook',
})

export const authLimiter = rateLimit({
	windowMs: 15 * 60 * 1000,
	limit: 5,

	keyGenerator: (req) => {
		const email = req.body?.email?.trim().toLowerCase() ?? ''
		return `${req.ip}:${email}`
	},

	message: 'Too many login attempts. Please try again later.',
})
