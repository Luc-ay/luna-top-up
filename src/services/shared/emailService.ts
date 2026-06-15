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
