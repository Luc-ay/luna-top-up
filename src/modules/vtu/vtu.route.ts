import { Router } from 'express'
import { authenticateUser } from '../../services/middleware/auth.middleware'
import {
	getAllVtuController,
	getVtuInfoController,
	getBillInfoController,
	purchaseVtuController,
} from './vtu.controller'

const vtuRouter = Router()

vtuRouter.get('/', authenticateUser, getAllVtuController)
vtuRouter.get('/:categoryCode', getVtuInfoController)
vtuRouter.get('/bill/:flwId', getBillInfoController)
vtuRouter.post('/purchase', authenticateUser, purchaseVtuController)

export default vtuRouter
