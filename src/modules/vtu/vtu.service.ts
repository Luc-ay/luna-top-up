import prisma from '../../config/db'
import redisClient from '../../config/redis'
import AppError from '../../services/shared/appError'
import { flwClient } from '../../config/flutterwave'
import { OK, NOT_FOUND, CONFLICT } from '../../services/shared/http'
import bcrypt from 'bcrypt'
import { PurchaseVtuInput } from './vtu.types'
import { dispatchPurchaseEmail, dispatchRefundEmail } from '../../services/shared/queues'

export async function getAllVtuService() {
	const getCache = await redisClient.get('vtu')
	if (getCache) {
		console.log('Cache hit for VTU categories')
		return JSON.parse(getCache)
	}

	console.log('Cache missing for VTU categories, fetching from DB')
	const vtu = await prisma.vtuCategory.findMany()
	await redisClient.set('vtu', JSON.stringify(vtu), 'EX', 60 * 60) // Cache for 1 hour
	return vtu
}

export async function getVtuInfoService(categoryCode: string) {
	const vtuCategories = await prisma.vtuCategory.findUnique({
		where: { code: categoryCode },
		select: {
			id: true,
			code: true,
			name: true,
		},
	})

	if (!vtuCategories) {
		throw new AppError('Service Provider not found', NOT_FOUND)
	}

	const vtuBillers = await prisma.vtuInfo.findMany({
		where: { categoryId: vtuCategories.id },
		select: {
			flwId: true,
			name: true,
			biller_code: true,
			description: true,
			short_name: true,
			logo: true,
		},
	})

	if (!vtuBillers) {
		throw new AppError('No billers found for this category', NOT_FOUND)
	}

	return vtuBillers
}

export async function getBillInfoService(flwId: number) {
	const billerInfo = await prisma.vtuInfo.findUnique({
		where: { flwId: flwId },
		select: {
			flwId: true,
			name: true,
			biller_code: true,
			description: true,
			short_name: true,
			logo: true,
		},
	})

	const response = await flwClient.get(
		`billers/${billerInfo?.biller_code}/items`,
		{
			params: {
				country: 'NG',
			},
		},
	)

	return response.data
}

// Helper: Calculate Cost & Profit split based on category rules
function calculateCostAndProfit(categoryCode: string, amount: number) {
	let profitPercent = 0
	switch (categoryCode.toUpperCase()) {
		case 'AIRTIME':
			profitPercent = 0.03 // 3% profit
			break
		case 'DATA':
			profitPercent = 0.05 // 5% profit
			break
		case 'CABLETV':
			profitPercent = 0.015 // 1.5% profit
			break
		case 'ELECTRICITY':
			profitPercent = 0.015 // 1.5% profit
			break
		default:
			profitPercent = 0.02 // default 2%
	}
	const profit = Number((amount * profitPercent).toFixed(2))
	const cost = Number((amount - profit).toFixed(2))
	return { cost, profit }
}

// Helper: Map category code to matching profit account name
function getProfitAccountName(categoryCode: string): string {
	switch (categoryCode.toUpperCase()) {
		case 'AIRTIME':
			return 'Profit_Airtime'
		case 'DATA':
			return 'Profit_Data'
		case 'CABLETV':
			return 'Profit_CableTV'
		case 'ELECTRICITY':
			return 'Profit_Electricity'
		default:
			return `Profit_${categoryCode}`
	}
}

// Helper: Reverse the hold escrowed funds back to the user's wallet
async function reverseEscrow(transactionId: string, userId: string, amount: number) {
	await prisma.$transaction(async (tx) => {
		const escrowAccount = await tx.account.findFirst({
			where: { name: 'System_Escrow', userId: null },
		})

		const userWallet = await tx.account.findFirst({
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

		if (!escrowAccount || !userWallet) {
			throw new Error('Required accounts for reversal are missing.')
		}

		// Update transaction status to FAILED
		await tx.transaction.update({
			where: { id: transactionId },
			data: { status: 'FAILED' },
		})

		// Refund the user: Decrement Escrow & Increment User Wallet
		await tx.account.update({
			where: { id: escrowAccount.id },
			data: { balance: { decrement: amount } },
		})

		await tx.account.update({
			where: { id: userWallet.id },
			data: { balance: { increment: amount } },
		})

		// Create refund ledger entry
		await tx.ledgerEntry.create({
			data: {
				amount,
				description: `Refund for failed VTU purchase (Tx: ${transactionId})`,
				transactionId,
				sourceAccountId: escrowAccount.id,
				destAccountId: userWallet.id,
			},
		})
	})
}

// Helper: Distribute escrowed funds to provider and profit accounts upon successful purchase
async function processVtuSuccess(
	transactionId: string,
	categoryCode: string,
	amount: number,
	providerRef: string | null
) {
	const { cost, profit } = calculateCostAndProfit(categoryCode, amount)
	const profitAccountName = getProfitAccountName(categoryCode)

	await prisma.$transaction(async (tx) => {
		const escrowAccount = await tx.account.findFirst({
			where: { name: 'System_Escrow', userId: null },
		})

		const providerAccount = await tx.account.findFirst({
			where: { name: 'Provider_Flutterwave', userId: null },
		}) || await tx.account.create({
			data: {
				name: 'Provider_Flutterwave',
				userId: null,
				account_type: 'SYSTEM_BANK',
				balance: 0,
			},
		})

		const profitAccount = await tx.account.findFirst({
			where: { name: profitAccountName, userId: null },
		}) || await tx.account.create({
			data: {
				name: profitAccountName,
				userId: null,
				account_type: 'SYSTEM_BANK',
				balance: 0,
			},
		})

		if (!escrowAccount) {
			throw new Error('System Escrow account is missing.')
		}

		// Update transaction status to SUCCESS
		await tx.transaction.update({
			where: { id: transactionId },
			data: {
				status: 'SUCCESS',
				providerReference: providerRef,
			},
		})

		// Decrement Escrow by full amount
		await tx.account.update({
			where: { id: escrowAccount.id },
			data: { balance: { decrement: amount } },
		})

		// Increment Provider account by cost
		await tx.account.update({
			where: { id: providerAccount.id },
			data: { balance: { increment: cost } },
		})

		// Create cost ledger entry
		await tx.ledgerEntry.create({
			data: {
				amount: cost,
				description: `VTU cost paid to provider (Tx: ${transactionId})`,
				transactionId,
				sourceAccountId: escrowAccount.id,
				destAccountId: providerAccount.id,
			},
		})

		// If there is profit, increment profit account and create ledger entry
		if (profit > 0) {
			await tx.account.update({
				where: { id: profitAccount.id },
				data: { balance: { increment: profit } },
			})

			await tx.ledgerEntry.create({
				data: {
					amount: profit,
					description: `VTU profit (Tx: ${transactionId})`,
					transactionId,
					sourceAccountId: escrowAccount.id,
					destAccountId: profitAccount.id,
				},
			})
		}
	})
}

export async function purchaseVtuService(data: PurchaseVtuInput, userId: string) {
	// 1. PIN verification
	const user = await prisma.user.findUnique({
		where: { id: userId },
		select: { transactionPin: true, email: true },
	})

	if (!user) {
		throw new AppError('User not found', NOT_FOUND)
	}

	if (!user.transactionPin) {
		throw new AppError('Transaction PIN is not set. Please configure a PIN in your profile first.', 400)
	}

	const isPinValid = user.transactionPin.startsWith('$2b$')
		? await bcrypt.compare(data.transactionPin, user.transactionPin)
		: data.transactionPin === user.transactionPin

	if (!isPinValid) {
		throw new AppError('Incorrect transaction PIN', 400)
	}

	// 2. Validate product code and active status
	const billerInfo = await prisma.vtuInfo.findUnique({
		where: { flwId: data.flwId },
		include: { category: true },
	})

	if (!billerInfo) {
		throw new AppError('Biller product not found', NOT_FOUND)
	}

	if (!billerInfo.isActive || !billerInfo.category.isActive) {
		throw new AppError('This service provider or product is currently unavailable', 400)
	}

	// 3. Initiate Escrow Hold Transaction
	const transactionId = await prisma.$transaction(async (tx) => {
		// Find user wallet
		const userWallet = await tx.account.findFirst({
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

		if (!userWallet) {
			throw new AppError('User wallet account not found', NOT_FOUND)
		}

		if (Number(userWallet.balance) < data.amount) {
			throw new AppError('Insufficient wallet balance', 400)
		}

		// Find/Create System Escrow account
		const escrowAccount = await tx.account.findFirst({
			where: { name: 'System_Escrow', userId: null },
		}) || await tx.account.create({
			data: {
				name: 'System_Escrow',
				userId: null,
				account_type: 'SYSTEM_BANK',
				balance: 0,
			},
		})

		// Perform Escrow debit/credit
		await tx.account.update({
			where: { id: userWallet.id },
			data: { balance: { decrement: data.amount } },
		})

		await tx.account.update({
			where: { id: escrowAccount.id },
			data: { balance: { increment: data.amount } },
		})

		// Create PENDING purchase transaction
		const transaction = await tx.transaction.create({
			data: {
				userId,
				amount: data.amount,
				type: billerInfo.category.code,
				status: 'PENDING',
			},
		})

		// Create Escrow ledger entry
		await tx.ledgerEntry.create({
			data: {
				amount: data.amount,
				description: `Escrow hold for ${billerInfo.name} purchase to ${data.phoneNumber}`,
				transactionId: transaction.id,
				sourceAccountId: userWallet.id,
				destAccountId: escrowAccount.id,
			},
		})

		return transaction.id
	})

	// 4. Execute API Call to Flutterwave (outside DB transaction)
	let response
	const reference = `Luna-VTU-${Date.now()}-${Math.floor(1000 + Math.random() * 9000)}`

	try {
		response = await flwClient.post('/bills', {
			country: 'NG',
			customer: data.phoneNumber,
			amount: data.amount,
			type: billerInfo.biller_code,
			reference,
			...(data.itemCode && { item_code: data.itemCode }),
		})
	} catch (error: any) {
		console.error('Flutterwave API Purchase Error:', error.response?.data || error.message)
		// Revert escrow hold (refund user)
		await reverseEscrow(transactionId, userId, data.amount)
		const errorMsg = error.response?.data?.message || error.message || 'Failed to complete VTU purchase via provider'

		dispatchRefundEmail(
			user.email,
			billerInfo.category.code,
			data.phoneNumber,
			data.amount,
			reference,
			errorMsg
		).catch((err) => console.error('Error dispatching refund email job:', err))

		throw new AppError(
			errorMsg,
			error.response?.status || 500
		)
	}

	const flwData = response.data
	const flwStatus = flwData?.data?.status?.toLowerCase()

	// 5. Finalize based on response
	if (flwData.status === 'success' && flwStatus !== 'failed') {
		if (flwStatus === 'successful') {
			await processVtuSuccess(transactionId, billerInfo.category.code, data.amount, String(flwData.data?.flw_ref || ''))

			dispatchPurchaseEmail(
				user.email,
				billerInfo.category.code,
				data.phoneNumber,
				data.amount,
				reference
			).catch((err) => console.error('Error dispatching purchase email job:', err))

			return {
				message: 'VTU purchase completed successfully',
				reference,
				providerReference: flwData.data?.flw_ref || null,
				status: 'SUCCESS',
			}
		} else {
			// Update status with provider reference but keep money in Escrow
			await prisma.transaction.update({
				where: { id: transactionId },
				data: {
					status: 'PENDING',
					providerReference: String(flwData.data?.flw_ref || ''),
				},
			})
			return {
				message: 'VTU purchase is processing. We will update you shortly.',
				reference,
				providerReference: flwData.data?.flw_ref || null,
				status: 'PENDING',
			}
		}
	} else {
		// Revert escrow hold (refund user)
		await reverseEscrow(transactionId, userId, data.amount)

		dispatchRefundEmail(
			user.email,
			billerInfo.category.code,
			data.phoneNumber,
			data.amount,
			reference,
			flwData.message || 'VTU purchase failed at provider'
		).catch((err) => console.error('Error dispatching refund email job:', err))

		throw new AppError(flwData.message || 'VTU purchase failed at provider', 400)
	}
}
