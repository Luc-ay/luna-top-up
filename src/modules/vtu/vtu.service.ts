import prisma from '../../config/db'
import redisClient from '../../config/redis'
import AppError from '../../services/shared/appError'
import { flwClient } from '../../config/flutterwave'
import { OK, NOT_FOUND, CONFLICT } from '../../services/shared/http'

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
