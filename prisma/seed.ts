// import { PrismaClient, AccountType } from '@prisma/client'
import prisma from '../src/config/db'
import { flwClient } from './../src/config/flutterwave'

async function main() {
	console.log('Starting VTU Info sync...')

	const categories = await prisma.vtuCategory.findMany()
	console.log(
		`Found ${categories.length} categories in DB. Fetching billers...`,
	)

	for (const category of categories) {
		try {
			console.log(
				`Fetching billers for category: ${category.code}...`,
			)

			const response = await flwClient.get(
				`/bills/${category.code}/billers`,
				{
					params: {
						country: 'NG',
					},
				},
			)

			const billersFromFlw = response.data.data

			if (!billersFromFlw || billersFromFlw.length === 0) {
				console.log(
					`No billers returned for ${category.code}. Skipping...`,
				)
				continue
			}

			console.log(
				`Found ${billersFromFlw.length} billers for ${category.code}. Saving...`,
			)

			for (const billerInfo of billersFromFlw) {
				const existingBiller = await prisma.vtuInfo.findFirst({
					where: { flwId: billerInfo.id },
				})

				if (!existingBiller) {
					await prisma.vtuInfo.create({
						data: {
							flwId: billerInfo.id,
							name: billerInfo.name,
							biller_code: billerInfo.biller_code,
							description:
								billerInfo.description || '',
							short_name:
								billerInfo.short_name || '',
							logo: billerInfo.logo || null,
							categoryId: category.id,
						},
					})
					console.log(`Created: ${billerInfo.name}`)
				} else {
					console.log(
						`Skipped: ${billerInfo.name} already exists`,
					)
				}
			}
		} catch (error: any) {
			console.error(
				`Failed to sync category ${category.code}:`,
				error.response?.data || error.message,
			)
		}
	}

	console.log('All VTU Info successfully synced!')
}

main()
	.catch((e) => {
		console.error(' Seeding failed:', e)
		process.exit(1)
	})
	.finally(async () => {
		await prisma.$disconnect()
	})
