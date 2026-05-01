import { swaggerUI } from '@hono/swagger-ui'
import { Hono } from 'hono'
import { generateOpenAPISpec } from '../utils/openapi-generator'

const swaggerRouter = new Hono()

// Serve the OpenAPI document
swaggerRouter.get('/doc', (c) => {
  const spec = generateOpenAPISpec()
  return c.json(spec)
})

// Serve Swagger UI
swaggerRouter.get('/ui', swaggerUI({ url: '/doc' }))

export default swaggerRouter
