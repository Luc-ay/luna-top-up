import asyncHandler from '../../services/shared/catchError'
import {
	getAllVtuService,
	getVtuInfoService,
	getBillInfoService,
} from './vtu.service'

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
