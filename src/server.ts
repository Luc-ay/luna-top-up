import app from './app'
import 'dotenv/config'
import { PORT } from './config/env'

const port = Number(PORT)

const server = app.listen(port, () => {
	console.log(`App is running on port: ${PORT}`)
})
