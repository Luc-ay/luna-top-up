import swaggerJSDoc from 'swagger-jsdoc'
import { PORT } from './env'

const options: swaggerJSDoc.Options = {
	definition: {
		openapi: '3.0.0',
		info: {
			title: 'Luna Top Up VTU API',
			version: '1.0.0',
			description: 'API Documentation for Luna Top Up VTU platform',
		},
		servers: [
			{
				url: `http://localhost:${PORT}`,
				description: 'Development Server',
			},
		],
		components: {
			securitySchemes: {
				bearerAuth: {
					type: 'http',
					scheme: 'bearer',
					bearerFormat: 'JWT',
					description: 'Enter your Bearer token in the format: Bearer <token>',
				},
			},
		},
		security: [
			{
				bearerAuth: [],
			},
		],
	},
	// Path to the API docs files containing annotations
	apis: ['./src/docs/*.ts', './src/docs/*.js'],
}

export const swaggerSpec = swaggerJSDoc(options)
