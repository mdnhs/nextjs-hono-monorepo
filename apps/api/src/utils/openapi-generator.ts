import type { OpenAPIV3 } from 'openapi-types'

interface RouteInfo {
  path: string
  method: string
  tags: string[]
  summary: string
  description?: string
  requiresAuth?: boolean
  params?: Record<string, { type: string; description: string }>
  query?: Record<string, { type: string; description: string }>
  requestBody?: Record<string, unknown>
  responses?: Record<string, { description: string; schema?: Record<string, unknown> }>
}

// Auto-discovered routes - update this as new endpoints are added
const routes: RouteInfo[] = [
  // Health
  {
    path: '/health',
    method: 'get',
    tags: ['Health'],
    summary: 'Health check',
    responses: {
      '200': { description: 'Server is healthy' },
    },
  },

  // Auth
  {
    path: '/api/auth/register',
    method: 'post',
    tags: ['Auth'],
    summary: 'Register a new user',
    requestBody: {
      email: { type: 'string', format: 'email' },
      password: { type: 'string', minLength: 6 },
      name: { type: 'string' },
    },
    responses: {
      '201': { description: 'User registered successfully' },
      '400': { description: 'Validation error' },
      '409': { description: 'User already exists' },
    },
  },
  {
    path: '/api/auth/login',
    method: 'post',
    tags: ['Auth'],
    summary: 'Login user',
    requestBody: {
      email: { type: 'string', format: 'email' },
      password: { type: 'string' },
    },
    responses: {
      '200': { description: 'Login successful' },
      '401': { description: 'Invalid credentials' },
    },
  },
  {
    path: '/api/auth/logout',
    method: 'post',
    tags: ['Auth'],
    summary: 'Logout user',
    requiresAuth: true,
    responses: {
      '200': { description: 'Logout successful' },
    },
  },
  {
    path: '/api/auth/profile',
    method: 'get',
    tags: ['Auth'],
    summary: 'Get user profile',
    requiresAuth: true,
    responses: {
      '200': { description: 'User profile' },
      '401': { description: 'Unauthorized' },
    },
  },

  // Stores
  {
    path: '/api/stores',
    method: 'get',
    tags: ['Stores'],
    summary: 'Get all stores',
    query: {
      status: { type: 'string', description: 'Filter by store status' },
      page: { type: 'integer', description: 'Page number' },
      limit: { type: 'integer', description: 'Items per page' },
    },
    responses: {
      '200': { description: 'List of stores' },
    },
  },
  {
    path: '/api/stores/:id',
    method: 'get',
    tags: ['Stores'],
    summary: 'Get store by ID',
    params: {
      id: { type: 'string', description: 'Store ID' },
    },
    responses: {
      '200': { description: 'Store details' },
      '404': { description: 'Store not found' },
    },
  },
  {
    path: '/api/stores/slug/:slug',
    method: 'get',
    tags: ['Stores'],
    summary: 'Get store by slug',
    params: {
      slug: { type: 'string', description: 'Store slug' },
    },
    responses: {
      '200': { description: 'Store details' },
      '404': { description: 'Store not found' },
    },
  },
  {
    path: '/api/stores/my',
    method: 'get',
    tags: ['Stores'],
    summary: 'Get user stores',
    requiresAuth: true,
    responses: {
      '200': { description: 'List of user stores' },
    },
  },
  {
    path: '/api/stores',
    method: 'post',
    tags: ['Stores'],
    summary: 'Create a store',
    requiresAuth: true,
    requestBody: {
      name: { type: 'string' },
      slug: { type: 'string' },
      description: { type: 'string' },
    },
    responses: {
      '201': { description: 'Store created' },
    },
  },
  {
    path: '/api/stores/:id',
    method: 'put',
    tags: ['Stores'],
    summary: 'Update a store',
    requiresAuth: true,
    params: {
      id: { type: 'string', description: 'Store ID' },
    },
    responses: {
      '200': { description: 'Store updated' },
    },
  },
  {
    path: '/api/stores/:id',
    method: 'delete',
    tags: ['Stores'],
    summary: 'Delete a store',
    requiresAuth: true,
    params: {
      id: { type: 'string', description: 'Store ID' },
    },
    responses: {
      '200': { description: 'Store deleted' },
    },
  },
  {
    path: '/api/stores/:id/publish',
    method: 'patch',
    tags: ['Stores'],
    summary: 'Publish a store',
    requiresAuth: true,
    params: {
      id: { type: 'string', description: 'Store ID' },
    },
    responses: {
      '200': { description: 'Store published' },
    },
  },
  {
    path: '/api/stores/:id/unpublish',
    method: 'patch',
    tags: ['Stores'],
    summary: 'Unpublish a store',
    requiresAuth: true,
    params: {
      id: { type: 'string', description: 'Store ID' },
    },
    responses: {
      '200': { description: 'Store unpublished' },
    },
  },

  // Products
  {
    path: '/api/products',
    method: 'get',
    tags: ['Products'],
    summary: 'Get all products',
    query: {
      storeId: { type: 'string', description: 'Filter by store' },
      categoryId: { type: 'string', description: 'Filter by category' },
      isActive: { type: 'boolean', description: 'Filter by active status' },
      minPrice: { type: 'number', description: 'Minimum price' },
      maxPrice: { type: 'number', description: 'Maximum price' },
      search: { type: 'string', description: 'Search query' },
      page: { type: 'integer', description: 'Page number' },
      limit: { type: 'integer', description: 'Items per page' },
    },
    responses: {
      '200': { description: 'List of products' },
    },
  },
  {
    path: '/api/products/my',
    method: 'get',
    tags: ['Products'],
    summary: 'Get seller products',
    requiresAuth: true,
    responses: {
      '200': { description: 'List of seller products' },
    },
  },
  {
    path: '/api/products/:id',
    method: 'get',
    tags: ['Products'],
    summary: 'Get product by ID',
    params: {
      id: { type: 'string', description: 'Product ID' },
    },
    responses: {
      '200': { description: 'Product details' },
      '404': { description: 'Product not found' },
    },
  },
  {
    path: '/api/products/sku/:sku',
    method: 'get',
    tags: ['Products'],
    summary: 'Get product by SKU',
    params: {
      sku: { type: 'string', description: 'Product SKU' },
    },
    responses: {
      '200': { description: 'Product details' },
      '404': { description: 'Product not found' },
    },
  },
  {
    path: '/api/products/:id',
    method: 'patch',
    tags: ['Products'],
    summary: 'Update a product',
    requiresAuth: true,
    params: {
      id: { type: 'string', description: 'Product ID' },
    },
    responses: {
      '200': { description: 'Product updated' },
    },
  },
  {
    path: '/api/products/:id',
    method: 'delete',
    tags: ['Products'],
    summary: 'Delete a product',
    requiresAuth: true,
    params: {
      id: { type: 'string', description: 'Product ID' },
    },
    responses: {
      '200': { description: 'Product deleted' },
    },
  },
  {
    path: '/api/products/:id/inventory',
    method: 'patch',
    tags: ['Products'],
    summary: 'Update product inventory',
    requiresAuth: true,
    params: {
      id: { type: 'string', description: 'Product ID' },
    },
    responses: {
      '200': { description: 'Inventory updated' },
    },
  },
  {
    path: '/api/products/:id/toggle-status',
    method: 'patch',
    tags: ['Products'],
    summary: 'Toggle product status',
    requiresAuth: true,
    params: {
      id: { type: 'string', description: 'Product ID' },
    },
    responses: {
      '200': { description: 'Product status toggled' },
    },
  },

  // Cart
  {
    path: '/api/cart',
    method: 'get',
    tags: ['Cart'],
    summary: 'Get user cart',
    requiresAuth: true,
    responses: {
      '200': { description: 'Cart contents' },
    },
  },
  {
    path: '/api/cart/summary',
    method: 'get',
    tags: ['Cart'],
    summary: 'Get cart summary',
    requiresAuth: true,
    responses: {
      '200': { description: 'Cart summary' },
    },
  },
  {
    path: '/api/cart',
    method: 'post',
    tags: ['Cart'],
    summary: 'Add item to cart',
    requiresAuth: true,
    requestBody: {
      productId: { type: 'string' },
      quantity: { type: 'integer', minimum: 1 },
    },
    responses: {
      '200': { description: 'Item added to cart' },
    },
  },
  {
    path: '/api/cart/:productId',
    method: 'patch',
    tags: ['Cart'],
    summary: 'Update cart item',
    requiresAuth: true,
    params: {
      productId: { type: 'string', description: 'Product ID' },
    },
    responses: {
      '200': { description: 'Cart item updated' },
    },
  },
  {
    path: '/api/cart/:productId',
    method: 'delete',
    tags: ['Cart'],
    summary: 'Remove item from cart',
    requiresAuth: true,
    params: {
      productId: { type: 'string', description: 'Product ID' },
    },
    responses: {
      '200': { description: 'Item removed from cart' },
    },
  },
  {
    path: '/api/cart/clear',
    method: 'delete',
    tags: ['Cart'],
    summary: 'Clear cart',
    requiresAuth: true,
    responses: {
      '200': { description: 'Cart cleared' },
    },
  },

  // Orders
  {
    path: '/api/orders',
    method: 'post',
    tags: ['Orders'],
    summary: 'Create an order',
    requiresAuth: true,
    requestBody: {
      shippingAddress: {
        type: 'object',
        properties: {
          street: { type: 'string' },
          city: { type: 'string' },
          state: { type: 'string' },
          postalCode: { type: 'string' },
          country: { type: 'string' },
          phone: { type: 'string' },
        },
      },
    },
    responses: {
      '201': { description: 'Order created' },
    },
  },
  {
    path: '/api/orders',
    method: 'get',
    tags: ['Orders'],
    summary: 'Get user orders',
    requiresAuth: true,
    query: {
      status: { type: 'string', description: 'Filter by order status' },
      page: { type: 'integer', description: 'Page number' },
      limit: { type: 'integer', description: 'Items per page' },
    },
    responses: {
      '200': { description: 'List of orders' },
    },
  },
  {
    path: '/api/orders/all',
    method: 'get',
    tags: ['Orders'],
    summary: 'Get all orders (admin)',
    requiresAuth: true,
    query: {
      status: { type: 'string', description: 'Filter by order status' },
      storeId: { type: 'string', description: 'Filter by store' },
      userId: { type: 'string', description: 'Filter by user' },
      page: { type: 'integer', description: 'Page number' },
      limit: { type: 'integer', description: 'Items per page' },
    },
    responses: {
      '200': { description: 'List of all orders' },
    },
  },
  {
    path: '/api/orders/:id',
    method: 'get',
    tags: ['Orders'],
    summary: 'Get order by ID',
    requiresAuth: true,
    params: {
      id: { type: 'string', description: 'Order ID' },
    },
    responses: {
      '200': { description: 'Order details' },
      '404': { description: 'Order not found' },
    },
  },
  {
    path: '/api/orders/:id/status',
    method: 'patch',
    tags: ['Orders'],
    summary: 'Update order status',
    requiresAuth: true,
    params: {
      id: { type: 'string', description: 'Order ID' },
    },
    responses: {
      '200': { description: 'Order status updated' },
    },
  },
  {
    path: '/api/orders/seller',
    method: 'get',
    tags: ['Orders'],
    summary: 'Get seller orders',
    requiresAuth: true,
    query: {
      status: { type: 'string', description: 'Filter by order status' },
      storeId: { type: 'string', description: 'Filter by store' },
      page: { type: 'integer', description: 'Page number' },
      limit: { type: 'integer', description: 'Items per page' },
    },
    responses: {
      '200': { description: 'List of seller orders' },
    },
  },
  {
    path: '/api/orders/store/:storeId',
    method: 'get',
    tags: ['Orders'],
    summary: 'Get store orders',
    requiresAuth: true,
    params: {
      storeId: { type: 'string', description: 'Store ID' },
    },
    responses: {
      '200': { description: 'List of store orders' },
    },
  },

  // Reviews
  {
    path: '/api/reviews/:productId',
    method: 'post',
    tags: ['Reviews'],
    summary: 'Create a review',
    requiresAuth: true,
    params: {
      productId: { type: 'string', description: 'Product ID' },
    },
    requestBody: {
      rating: { type: 'integer', minimum: 1, maximum: 5 },
      title: { type: 'string' },
      comment: { type: 'string', minLength: 10, maxLength: 1000 },
      images: { type: 'array', items: { type: 'string', format: 'uri' } },
      orderId: { type: 'string' },
    },
    responses: {
      '201': { description: 'Review created' },
    },
  },
  {
    path: '/api/reviews/:id',
    method: 'patch',
    tags: ['Reviews'],
    summary: 'Update a review',
    requiresAuth: true,
    params: {
      id: { type: 'string', description: 'Review ID' },
    },
    responses: {
      '200': { description: 'Review updated' },
    },
  },
  {
    path: '/api/reviews/:id',
    method: 'delete',
    tags: ['Reviews'],
    summary: 'Delete a review',
    requiresAuth: true,
    params: {
      id: { type: 'string', description: 'Review ID' },
    },
    responses: {
      '200': { description: 'Review deleted' },
    },
  },
  {
    path: '/api/reviews/product/:productId',
    method: 'get',
    tags: ['Reviews'],
    summary: 'Get product reviews',
    params: {
      productId: { type: 'string', description: 'Product ID' },
    },
    query: {
      rating: { type: 'integer', description: 'Filter by rating' },
      verified: { type: 'boolean', description: 'Filter verified purchases' },
      page: { type: 'integer', description: 'Page number' },
      limit: { type: 'integer', description: 'Items per page' },
    },
    responses: {
      '200': { description: 'List of reviews' },
    },
  },
  {
    path: '/api/reviews/product/:productId/stats',
    method: 'get',
    tags: ['Reviews'],
    summary: 'Get product rating stats',
    params: {
      productId: { type: 'string', description: 'Product ID' },
    },
    responses: {
      '200': { description: 'Rating statistics' },
    },
  },
  {
    path: '/api/reviews/my',
    method: 'get',
    tags: ['Reviews'],
    summary: 'Get user reviews',
    requiresAuth: true,
    responses: {
      '200': { description: 'List of user reviews' },
    },
  },
  {
    path: '/api/reviews/:id/helpful',
    method: 'patch',
    tags: ['Reviews'],
    summary: 'Mark review as helpful',
    requiresAuth: true,
    params: {
      id: { type: 'string', description: 'Review ID' },
    },
    responses: {
      '200': { description: 'Review marked as helpful' },
    },
  },
  {
    path: '/api/reviews/:productId/can-review',
    method: 'get',
    tags: ['Reviews'],
    summary: 'Check if user can review product',
    requiresAuth: true,
    params: {
      productId: { type: 'string', description: 'Product ID' },
    },
    responses: {
      '200': { description: 'Review eligibility' },
    },
  },

  // Categories
  {
    path: '/api/categories',
    method: 'get',
    tags: ['Categories'],
    summary: 'Get all categories',
    responses: {
      '200': { description: 'List of categories' },
    },
  },
  {
    path: '/api/categories/:slug',
    method: 'get',
    tags: ['Categories'],
    summary: 'Get category by slug',
    params: {
      slug: { type: 'string', description: 'Category slug' },
    },
    responses: {
      '200': { description: 'Category details' },
      '404': { description: 'Category not found' },
    },
  },
]

export function generateOpenAPISpec(): OpenAPIV3.Document {
  const spec: OpenAPIV3.Document = {
    openapi: '3.0.0',
    info: {
      title: 'E-commerce API',
      version: '1.0.0',
      description: 'API documentation for the e-commerce platform',
      contact: {
        name: 'API Support',
      },
    },
    servers: [
      {
        url: `http://localhost:${process.env.PORT || 3000}`,
        description: 'Local development server',
      },
      ...(process.env.API_URL
        ? [{ url: process.env.API_URL, description: 'Production server' }]
        : []),
    ],
    tags: [
      { name: 'Health', description: 'Health check endpoints' },
      { name: 'Auth', description: 'Authentication endpoints' },
      { name: 'Stores', description: 'Store management' },
      { name: 'Products', description: 'Product management' },
      { name: 'Cart', description: 'Shopping cart operations' },
      { name: 'Orders', description: 'Order management' },
      { name: 'Reviews', description: 'Product reviews' },
      { name: 'Categories', description: 'Product categories' },
    ],
    paths: buildPaths(),
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
          description: 'Enter your JWT token',
        },
        cookieAuth: {
          type: 'apiKey',
          in: 'cookie',
          name: 'token',
          description: 'JWT token stored in cookie',
        },
      },
    },
  }

  return spec
}

function buildPaths(): OpenAPIV3.PathsObject {
  const paths: OpenAPIV3.PathsObject = {}

  for (const route of routes) {
    const pathKey = route.path.replace(/:(\w+)/g, '{$1}')

    if (!paths[pathKey]) {
      paths[pathKey] = {}
    }

    const operation: OpenAPIV3.OperationObject = {
      tags: route.tags,
      summary: route.summary,
      ...(route.description && { description: route.description }),
      responses: buildResponses(route.responses),
    }

    if (route.requiresAuth) {
      operation.security = [{ bearerAuth: [] }, { cookieAuth: [] }]
    }

    if (route.params) {
      operation.parameters = Object.entries(route.params).map(
        ([name, param]) => ({
          name,
          in: 'path' as const,
          required: true,
          schema: { type: param.type as OpenAPIV3.SchemaObject['type'] },
          description: param.description,
        })
      )
    }

    if (route.query) {
      operation.parameters = [
        ...(operation.parameters || []),
        ...Object.entries(route.query).map(([name, param]) => ({
          name,
          in: 'query' as const,
          schema: { type: param.type as OpenAPIV3.SchemaObject['type'] },
          description: param.description,
        })),
      ]
    }

    if (route.requestBody && ['post', 'put', 'patch'].includes(route.method)) {
      operation.requestBody = {
        required: true,
        content: {
          'application/json': {
            schema: {
              type: 'object',
              properties: route.requestBody as Record<
                string,
                OpenAPIV3.SchemaObject
              >,
              required: Object.keys(route.requestBody),
            },
          },
        },
      }
    }

    ;(paths[pathKey] as Record<string, OpenAPIV3.OperationObject>)[
      route.method
    ] = operation
  }

  return paths
}

function buildResponses(
  responses: RouteInfo['responses']
): OpenAPIV3.ResponsesObject {
  if (!responses) {
    return {
      '200': { description: 'Successful operation' },
    }
  }

  const result: OpenAPIV3.ResponsesObject = {}

  for (const [code, response] of Object.entries(responses)) {
    result[code] = {
      description: response.description,
      content: {
        'application/json': {
          schema: response.schema || { type: 'object' },
        },
      },
    }
  }

  return result
}
