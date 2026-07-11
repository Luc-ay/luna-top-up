import prisma from '../../config/db'
import AppError from '../../services/shared/appError'
import { NOT_FOUND, UNAUTHORIZED } from '../../services/shared/http'
import bcrypt from 'bcrypt'
import { WalletTransferInput } from './wallet.types'

export async function getWalletService(userId: string) {
	const accounts = await prisma.account.findMany({
		where: { userId },
		select: {
			id: true,
			name: true,
			account_type: true,
			balance: true,
			createdAt: true,
			updatedAt: true,
		},
	})

	if (!accounts || accounts.length === 0) {
		throw new AppError('No wallet account found for this user', NOT_FOUND)
	}

	return accounts
}

export async function transferWalletFundsService(data: WalletTransferInput, userId: string) {
	// 1. Authenticate Sender & Verify Transaction PIN
	const sender = await prisma.user.findUnique({
		where: { id: userId },
		select: { transactionPin: true, email: true },
	})

	if (!sender) {
		throw new AppError('Sender user not found', NOT_FOUND)
	}

	if (!sender.transactionPin) {
		throw new AppError('Transaction PIN is not set. Please configure a PIN first.', 400)
	}

	const isPinValid = sender.transactionPin.startsWith('$2b$')
		? await bcrypt.compare(data.transactionPin, sender.transactionPin)
		: data.transactionPin === sender.transactionPin

	if (!isPinValid) {
		throw new AppError('Incorrect transaction PIN', 400)
	}

	// 2. Resolve Recipient User
	const normalizedRecipientEmail = data.recipientEmail.trim().toLowerCase()
	if (sender.email.toLowerCase() === normalizedRecipientEmail) {
		throw new AppError('You cannot transfer funds to your own wallet', 400)
	}

	const recipient = await prisma.user.findUnique({
		where: { email: normalizedRecipientEmail },
		select: { id: true, email: true, firstName: true, lastName: true },
	})

	if (!recipient) {
		throw new AppError('Recipient account with this email does not exist', NOT_FOUND)
	}

	// 3. Atomically perform transfer inside database transaction
	const result = await prisma.$transaction(async (tx) => {
		// Find Sender's wallet
		const senderWallet = await tx.account.findFirst({
			where: {
				userId,
				OR: [
					{ name: 'Main Wallet' },
					{ name: 'Main wallet' },
				],
			},
		}) || await tx.account.findFirst({
			where: { userId },
		})

		if (!senderWallet) {
			throw new AppError('Sender wallet account not found', NOT_FOUND)
		}

		if (Number(senderWallet.balance) < data.amount) {
			throw new AppError('Insufficient wallet balance', 400)
		}

		// Find or Create Recipient's wallet
		const recipientWallet = await tx.account.findFirst({
			where: {
				userId: recipient.id,
				OR: [
					{ name: 'Main Wallet' },
					{ name: 'Main wallet' },
				],
			},
		}) || await tx.account.create({
			data: {
				userId: recipient.id,
				name: 'Main Wallet',
				account_type: 'USER',
				balance: 0,
			},
		})

		// Deduct from sender & Credit recipient
		await tx.account.update({
			where: { id: senderWallet.id },
			data: { balance: { decrement: data.amount } },
		})

		await tx.account.update({
			where: { id: recipientWallet.id },
			data: { balance: { increment: data.amount } },
		})

		// Create transfer transaction
		const transaction = await tx.transaction.create({
			data: {
				userId,
				amount: data.amount,
				type: 'WALLET_TRANSFER',
				status: 'SUCCESS',
			},
		})

		// Record double-entry ledger entry
		await tx.ledgerEntry.create({
			data: {
				amount: data.amount,
				description: data.description || `Wallet transfer to ${recipient.firstName || ''} ${recipient.lastName || ''}`.trim() + ` (${recipient.email})`,
				transactionId: transaction.id,
				sourceAccountId: senderWallet.id,
				destAccountId: recipientWallet.id,
			},
		})

		return {
			transactionId: transaction.id,
			amount: data.amount,
			recipient: {
				email: recipient.email,
				name: `${recipient.firstName || ''} ${recipient.lastName || ''}`.trim(),
			},
		}
	})

	return {
		message: 'Wallet transfer completed successfully',
		data: result,
	}
}
