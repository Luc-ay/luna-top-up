import axios from 'axios'
import { FLW_SECRET_KEY } from './env'

export const flwClient = axios.create({
	baseURL: 'https://api.flutterwave.com/v3',
	headers: {
		Authorization: `Bearer ${FLW_SECRET_KEY}`,
		'Content-Type': 'application/json',
	},
})
