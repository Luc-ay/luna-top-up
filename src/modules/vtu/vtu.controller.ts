import asyncHandler from '../../services/shared/catchError'
import { OK } from '../../services/shared/http'
import {
	getAllVtuService,
	getVtuInfoService,
	getBillInfoService,
	purchaseVtuService,
} from './vtu.service'
import { PurchaseVtuSchema } from './vtu.types'

export const getAllVtuController = asyncHandler(async (req, res) => {
	const vtu = await getAllVtuService()
	res.status(200).json(vtu)
})

export const getVtuInfoController = asyncHandler(async (req, res) => {
	const { categoryCode } = req.params
	const vtuBillers = await getVtuInfoService(categoryCode.toString())
	res.status(200).json(vtuBillers)
})

export const getBillInfoController = asyncHandler(async (req, res) => {
	const { flwId } = req.params
	const billInfo = await getBillInfoService(Number(flwId))
	res.status(200).json(billInfo)
})

export const purchaseVtuController = asyncHandler(async (req, res) => {
	const userId = req.user?.id
	const data = PurchaseVtuSchema.parse(req.body)
	const result = await purchaseVtuService(data, userId)

	return res.status(OK).json(result)
})
