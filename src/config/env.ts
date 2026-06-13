import dotenv from 'dotenv'
dotenv.config()

const getEnv = (key: string): string => {
	const value = process.env[key]

	if (!value) {
		throw new Error(`Missing Environment Variable ${key}`)
	}

	return value
}

export const DATABASE_URL = getEnv('DATABASE_URL')
export const PORT = getEnv('PORT')
