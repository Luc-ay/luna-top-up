import { Router } from 'express'
import { authenticateUser } from '../../services/middleware/auth.middleware'
import {
	getAllVtuController,
	getVtuInfoController,
	getBillInfoController,
} from './vtu.controller'

const vtuRouter = Router()

vtuRouter.get('/', authenticateUser, getAllVtuController)
vtuRouter.get('/:categoryCode', getVtuInfoController)
vtuRouter.get('/bill/:flwId', getBillInfoController)

export default vtuRouter
