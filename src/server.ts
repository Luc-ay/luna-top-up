import app from './app'
import 'dotenv/config'
import { PORT } from './config/env'
import './services/shared/workers'

const port = Number(PORT)

const server = app.listen(port, () => {
	console.log(`App is running on port: ${PORT}`)
})
