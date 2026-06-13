import { Role } from '@prisma/client'
import jwt from 'jsonwebtoken'
import { ACCESS_TOKEN_SECRET, ACCESS_TOKEN_EXPIRE_AT } from '../../config/env'

type AuthToken = {
	id: string
	email: string
	role: Role
}

export function generateToken(payload: AuthToken): string {
	const accessToken = jwt.sign(payload, ACCESS_TOKEN_SECRET, {
		expiresIn: ACCESS_TOKEN_EXPIRE_AT as any,
	})

	return accessToken
}
