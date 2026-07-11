import { EMAIL_FROM, BREVO_API_KEY } from '../../config/env'
import AppError from './appError'

interface SendEmailResponse {
	success: boolean
	error?: any
}

interface SendPasswordResponse {
	success: boolean
	error?: any
}

const APP_NAME = 'Luna Top up'

export async function sendWelcomeEmail(
	email: string,
	fullName: string,
): Promise<SendEmailResponse> {
	try {
		// 1. Define your inline HTML content using template variables
		const htmlContent = `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; color: #333;">
                <h2>Welcome to ${APP_NAME}, ${fullName}!</h2>
                <p>We are thrilled to have you on board.</p>
                <p>Your account has been successfully set up, and you can now start exploring all our features.</p>
                <p>If you have any questions or need help, just reply directly to this email.</p>
                <br>
                <p>Best regards,</p>
                <p><strong>The ${APP_NAME} Team</strong></p>
            </div>
        `

		const response = await fetch('https://api.brevo.com/v3/smtp/email', {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json',
				'api-key': BREVO_API_KEY as string,
			},
			body: JSON.stringify({
				sender: {
					email: EMAIL_FROM as string,
					name: APP_NAME,
				},
				// Added the user's name here so it looks better in their inbox (e.g., "John Doe <john@test.com>")
				to: [{ email, name: fullName }],

				// 2. Add the required Subject and HTML body
				subject: `Welcome to ${APP_NAME}! 🎉`,
				htmlContent: htmlContent,
			}),
		})

		if (!response.ok) {
			const errorData: unknown = await response.json()
			// Pro-Tip: Pass the actual response.status instead of a hardcoded 500
			throw new AppError(JSON.stringify(errorData), response.status)
		}

		return { success: true }
	} catch (error: unknown) {
		const message =
			error instanceof Error ? error.message : 'Unknown error occurred'

		console.error('Error sending welcome email:', message)

		return { success: false, error: message }
	}
}

export async function resetPasswordCode(
	email: string,
	code: string,
): Promise<SendPasswordResponse> {
	try {
		const htmlContent = `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; color: #333;">
                <h2>Your Password reset OTP from ${APP_NAME}!</h2>
                <p>Your OTP code is <span style="font-size: 12px; font-weight: bold; color: #292929",>${code}</span>.</p>
                <p>You are getting this mail because you requested for a reset password code.</p>
                <p>If you did not initiate this request, just reply directly to this email.</p>
                <br>
                <p>Best regards,</p>
                <p><strong>The ${APP_NAME} Team</strong></p>
            </div>
        `
		const response = await fetch('https://api.brevo.com/v3/smtp/email', {
			method: 'POST',
			headers: {
				'Content-type': 'application/json',
				'api-key': BREVO_API_KEY as string,
			},
			body: JSON.stringify({
				sender: {
					email: EMAIL_FROM as string,
					name: APP_NAME,
				},
				to: [{ email }],
				subject: 'Request for password reset code',
				htmlContent: htmlContent,
			}),
		})

		if (!response.ok) {
			const errorData: unknown = await response.json()
			throw new AppError(JSON.stringify(errorData), response.status)
		}

		return { success: true }
	} catch (error) {
		const message =
			error instanceof Error ? error.message : 'Unknown error occurred'
		console.error('Error sending OTP Mail')
		return { success: false, error: message }
	}
}

export async function sendDepositEmail(
	email: string,
	amount: number,
	reference: string
): Promise<SendEmailResponse> {
	try {
		const htmlContent = `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; color: #333; line-height: 1.6; border: 1px solid #eee; padding: 20px; border-radius: 8px;">
                <h2 style="color: #2e7d32;">Deposit Successful! 🎉</h2>
                <p>Hello,</p>
                <p>Your wallet has been successfully funded with <strong>₦${amount.toLocaleString()}</strong>.</p>
                <div style="background-color: #f9f9f9; padding: 15px; border-radius: 5px; margin: 15px 0;">
                    <p style="margin: 5px 0;"><strong>Transaction Reference:</strong> ${reference}</p>
                    <p style="margin: 5px 0;"><strong>Amount Credited:</strong> ₦${amount.toLocaleString()}</p>
                    <p style="margin: 5px 0;"><strong>Status:</strong> Successful</p>
                </div>
                <p>You can now use your wallet balance to purchase airtime, data bundles, and pay other utility bills.</p>
                <p>Thank you for choosing ${APP_NAME}.</p>
                <br>
                <p>Best regards,</p>
                <p><strong>The ${APP_NAME} Team</strong></p>
            </div>
        `

		const response = await fetch('https://api.brevo.com/v3/smtp/email', {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json',
				'api-key': BREVO_API_KEY as string,
			},
			body: JSON.stringify({
				sender: {
					email: EMAIL_FROM as string,
					name: APP_NAME,
				},
				to: [{ email }],
				subject: `Wallet Funded: ₦${amount.toLocaleString()}! 💳`,
				htmlContent,
			}),
		})

		if (!response.ok) {
			const errorData: unknown = await response.json()
			throw new AppError(JSON.stringify(errorData), response.status)
		}

		return { success: true }
	} catch (error) {
		const message = error instanceof Error ? error.message : 'Unknown error occurred'
		console.error('Error sending deposit email:', message)
		return { success: false, error: message }
	}
}

export async function sendPurchaseEmail(
	email: string,
	serviceType: string,
	phoneNumber: string,
	amount: number,
	reference: string
): Promise<SendEmailResponse> {
	try {
		const htmlContent = `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; color: #333; line-height: 1.6; border: 1px solid #eee; padding: 20px; border-radius: 8px;">
                <h2 style="color: #1976d2;">Purchase Successful! 🛒</h2>
                <p>Hello,</p>
                <p>Your purchase of <strong>${serviceType.toUpperCase()}</strong> has been completed successfully.</p>
                <div style="background-color: #f9f9f9; padding: 15px; border-radius: 5px; margin: 15px 0;">
                    <p style="margin: 5px 0;"><strong>Product:</strong> ${serviceType.toUpperCase()}</p>
                    <p style="margin: 5px 0;"><strong>Recipient Number:</strong> ${phoneNumber}</p>
                    <p style="margin: 5px 0;"><strong>Amount Charged:</strong> ₦${amount.toLocaleString()}</p>
                    <p style="margin: 5px 0;"><strong>Reference:</strong> ${reference}</p>
                </div>
                <p>The top-up has been sent to the recipient. Thank you for using ${APP_NAME}!</p>
                <br>
                <p>Best regards,</p>
                <p><strong>The ${APP_NAME} Team</strong></p>
            </div>
        `

		const response = await fetch('https://api.brevo.com/v3/smtp/email', {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json',
				'api-key': BREVO_API_KEY as string,
			},
			body: JSON.stringify({
				sender: {
					email: EMAIL_FROM as string,
					name: APP_NAME,
				},
				to: [{ email }],
				subject: `${serviceType.toUpperCase()} Purchase Successful! 📱`,
				htmlContent,
			}),
		})

		if (!response.ok) {
			const errorData: unknown = await response.json()
			throw new AppError(JSON.stringify(errorData), response.status)
		}

		return { success: true }
	} catch (error) {
		const message = error instanceof Error ? error.message : 'Unknown error occurred'
		console.error('Error sending purchase email:', message)
		return { success: false, error: message }
	}
}

export async function sendRefundEmail(
	email: string,
	serviceType: string,
	phoneNumber: string,
	amount: number,
	reference: string,
	reason?: string
): Promise<SendEmailResponse> {
	try {
		const htmlContent = `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; color: #333; line-height: 1.6; border: 1px solid #eee; padding: 20px; border-radius: 8px;">
                <h2 style="color: #d32f2f;">Purchase Failed & Refunded 🔄</h2>
                <p>Hello,</p>
                <p>We are writing to let you know that your purchase of <strong>${serviceType.toUpperCase()}</strong> for <strong>${phoneNumber}</strong> could not be completed by the service provider.</p>
                <p>As a result, your wallet has been fully refunded with <strong>₦${amount.toLocaleString()}</strong>.</p>
                <div style="background-color: #f9f9f9; padding: 15px; border-radius: 5px; margin: 15px 0;">
                    <p style="margin: 5px 0;"><strong>Failed Product:</strong> ${serviceType.toUpperCase()}</p>
                    <p style="margin: 5px 0;"><strong>Target Number:</strong> ${phoneNumber}</p>
                    <p style="margin: 5px 0;"><strong>Refunded Amount:</strong> ₦${amount.toLocaleString()}</p>
                    <p style="margin: 5px 0;"><strong>Reference:</strong> ${reference}</p>
                    ${reason ? `<p style="margin: 5px 0;"><strong>Reason:</strong> ${reason}</p>` : ''}
                </div>
                <p>Your new balance is updated and available for use immediately. We apologize for the inconvenience.</p>
                <br>
                <p>Best regards,</p>
                <p><strong>The ${APP_NAME} Team</strong></p>
            </div>
        `

		const response = await fetch('https://api.brevo.com/v3/smtp/email', {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json',
				'api-key': BREVO_API_KEY as string,
			},
			body: JSON.stringify({
				sender: {
					email: EMAIL_FROM as string,
					name: APP_NAME,
				},
				to: [{ email }],
				subject: `Refund Processed: ₦${amount.toLocaleString()} 🔄`,
				htmlContent,
			}),
		})

		if (!response.ok) {
			const errorData: unknown = await response.json()
			throw new AppError(JSON.stringify(errorData), response.status)
		}

		return { success: true }
	} catch (error) {
		const message = error instanceof Error ? error.message : 'Unknown error occurred'
		console.error('Error sending refund email:', message)
		return { success: false, error: message }
	}
}
