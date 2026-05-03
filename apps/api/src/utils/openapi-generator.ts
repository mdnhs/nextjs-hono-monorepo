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
    path: '/api/v1/auth/register',
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
    path: '/api/v1/auth/login',
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
    path: '/api/v1/auth/logout',
    method: 'post',
    tags: ['Auth'],
    summary: 'Logout user',
    requiresAuth: true,
    responses: {
      '200': { description: 'Logout successful' },
    },
  },
  {
    path: '/api/v1/auth/profile',
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
    path: '/api/v1/stores',
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
    path: '/api/v1/stores/:id',
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
    path: '/api/v1/stores/slug/:slug',
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
    path: '/api/v1/stores/my',
    method: 'get',
    tags: ['Stores'],
    summary: 'Get user stores',
    requiresAuth: true,
    responses: {
      '200': { description: 'List of user stores' },
    },
  },
  {
    path: '/api/v1/stores',
    method: 'post',
    tags: ['Stores'],
    summary: 'Create a store',
    description: 'Create a new store. The slug becomes the subdomain: {slug}.{APP_DOMAIN}. Custom domain requires Pro or Enterprise plan.',
    requiresAuth: true,
    requestBody: {
      name: { type: 'string', description: 'Store display name' },
      slug: { type: 'string', description: 'Unique slug — used as subdomain: {slug}.yourdomain.com. Lowercase alphanumeric and hyphens only.' },
      description: { type: 'string', description: 'Store description' },
      logo: { type: 'string', description: 'Logo URL' },
      planId: { type: 'string', description: 'Subscription plan ID. Required if setting customDomain.' },
      customDomain: { type: 'string', description: 'Custom domain (e.g. mystore.com). Requires Pro or Enterprise plan. Set DNS CNAME to your APP_DOMAIN.' },
    },
    responses: {
      '201': { description: 'Store created and pending admin approval' },
      '400': { description: 'Validation error or plan does not support custom domain' },
      '409': { description: 'Slug or custom domain already in use' },
    },
  },
  {
    path: '/api/v1/stores/:id',
    method: 'patch',
    tags: ['Stores'],
    summary: 'Update a store',
    description: 'Update store details including domain. Set customDomain to null to remove it. Changing customDomain requires Pro or Enterprise plan.',
    requiresAuth: true,
    params: {
      id: { type: 'string', description: 'Store ID' },
    },
    requestBody: {
      name: { type: 'string', description: 'Store display name' },
      description: { type: 'string', description: 'Store description' },
      slug: { type: 'string', description: 'Store slug (also changes subdomain)' },
      logo: { type: 'string', description: 'Logo URL' },
      customDomain: { type: 'string', description: 'Custom domain (e.g. mystore.com). Set to null to remove. Requires Pro or Enterprise plan.' },
    },
    responses: {
      '200': { description: 'Store updated' },
      '400': { description: 'Validation error or plan does not support custom domain' },
      '403': { description: 'Not authorized' },
      '404': { description: 'Store not found' },
      '409': { description: 'Slug or custom domain already in use' },
    },
  },
  {
    path: '/api/v1/stores/:id',
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
  // Products
  {
    path: '/api/v1/products',
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
    path: '/api/v1/products/my',
    method: 'get',
    tags: ['Products'],
    summary: 'Get seller products',
    requiresAuth: true,
    responses: {
      '200': { description: 'List of seller products' },
    },
  },
  {
    path: '/api/v1/products/:id',
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
    path: '/api/v1/products/sku/:sku',
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
    path: '/api/v1/products',
    method: 'post',
    tags: ['Products'],
    summary: 'Create a product',
    description: 'Create a new product. Subject to plan limits.',
    requiresAuth: true,
    requestBody: {
      name: { type: 'string', description: 'Product name' },
      description: { type: 'string', description: 'Product description' },
      price: { type: 'number', description: 'Product price' },
      sku: { type: 'string', description: 'Product SKU' },
      inventory: { type: 'integer', description: 'Initial inventory count' },
      categoryId: { type: 'string', description: 'Category ID' },
      storeId: { type: 'string', description: 'Store ID' },
      images: { type: 'array', items: { type: 'string' }, description: 'Product images' },
    },
    responses: {
      '201': { description: 'Product created successfully' },
      '400': { description: 'Validation error' },
      '402': { description: 'Product limit reached' },
      '403': { description: 'Not authorized' },
    },
  },
  {
    path: '/api/v1/products/:id',
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
    path: '/api/v1/products/:id',
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
    path: '/api/v1/products/:id/inventory',
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
    path: '/api/v1/products/:id/toggle-status',
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

  // Storefront Cart
  {
    path: '/api/v1/storefront/cart',
    method: 'get',
    tags: ['Storefront'],
    summary: 'Get storefront cart',
    description: 'Retrieves the cart for the current visitor session (scoped by store and customer token).',
    responses: {
      '200': { description: 'Cart contents' },
    },
  },
  {
    path: '/api/v1/storefront/cart/items',
    method: 'post',
    tags: ['Storefront'],
    summary: 'Add item to storefront cart',
    requestBody: {
      productId: { type: 'string' },
      variantId: { type: 'string' },
      quantity: { type: 'integer', minimum: 1 },
    },
    responses: {
      '200': { description: 'Item added to cart' },
    },
  },
  {
    path: '/api/v1/storefront/cart/items/:itemId',
    method: 'patch',
    tags: ['Storefront'],
    summary: 'Update storefront cart item',
    params: {
      itemId: { type: 'string', description: 'Cart Item ID' },
    },
    requestBody: {
      quantity: { type: 'integer', minimum: 0 },
    },
    responses: {
      '200': { description: 'Cart item updated' },
    },
  },
  {
    path: '/api/v1/storefront/cart/items/:itemId',
    method: 'delete',
    tags: ['Storefront'],
    summary: 'Remove item from storefront cart',
    params: {
      itemId: { type: 'string', description: 'Cart Item ID' },
    },
    responses: {
      '200': { description: 'Item removed from cart' },
    },
  },
  {
    path: '/api/v1/storefront/cart',
    method: 'delete',
    tags: ['Storefront'],
    summary: 'Clear storefront cart',
    responses: {
      '200': { description: 'Cart cleared' },
    },
  },

  // Storefront Checkout
  {
    path: '/api/v1/storefront/checkout',
    method: 'post',
    tags: ['Storefront'],
    summary: 'Process storefront checkout',
    description: 'Converts the current cart into an order. Subject to rate limits and idempotency.',
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
        required: ['street', 'city', 'state', 'postalCode', 'country', 'phone'],
      },
      discountCode: { type: 'string' },
    },
    responses: {
      '201': { description: 'Order created' },
      '400': { description: 'Validation error or empty cart' },
      '402': { description: 'Order limit reached' },
    },
  },
  {
    path: '/api/v1/orders',
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
    path: '/api/v1/orders/all',
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
    path: '/api/v1/orders/:id',
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
    path: '/api/v1/orders/:id/status',
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
    path: '/api/v1/orders/seller',
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
    path: '/api/v1/orders/store/:storeId',
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
    path: '/api/v1/reviews/:productId',
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
    path: '/api/v1/reviews/:id',
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
    path: '/api/v1/reviews/:id',
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
    path: '/api/v1/reviews/product/:productId',
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
    path: '/api/v1/reviews/product/:productId/stats',
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
    path: '/api/v1/reviews/my',
    method: 'get',
    tags: ['Reviews'],
    summary: 'Get user reviews',
    requiresAuth: true,
    responses: {
      '200': { description: 'List of user reviews' },
    },
  },
  {
    path: '/api/v1/reviews/:id/helpful',
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
    path: '/api/v1/reviews/:productId/can-review',
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
  {
    path: '/api/v1/reviews/:id/helpful',
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
    path: '/api/v1/reviews/:productId/can-review',
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
    path: '/api/v1/categories',
    method: 'get',
    tags: ['Categories'],
    summary: 'Get all categories',
    responses: {
      '200': { description: 'List of categories' },
    },
  },
  {
    path: '/api/v1/categories/:slug',
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

  // Plans
  {
    path: '/api/v1/plans',
    method: 'get',
    tags: ['Plans'],
    summary: 'Get active plans',
    responses: {
      '200': { description: 'List of active plans' },
    },
  },
  {
    path: '/api/v1/plans/all',
    method: 'get',
    tags: ['Plans'],
    summary: 'Get all plans (admin)',
    requiresAuth: true,
    responses: {
      '200': { description: 'List of all plans' },
    },
  },
  {
    path: '/api/v1/plans/:id',
    method: 'get',
    tags: ['Plans'],
    summary: 'Get plan by ID',
    params: {
      id: { type: 'string', description: 'Plan ID' },
    },
    responses: {
      '200': { description: 'Plan details' },
      '404': { description: 'Plan not found' },
    },
  },
  {
    path: '/api/v1/plans',
    method: 'post',
    tags: ['Plans'],
    summary: 'Create a plan (admin)',
    requiresAuth: true,
    requestBody: {
      name: { type: 'string' },
      slug: { type: 'string' },
      description: { type: 'string' },
      priceMonthly: { type: 'number' },
      priceYearly: { type: 'number' },
      trialDays: { type: 'integer' },
      maxStores: { type: 'integer' },
      maxProducts: { type: 'integer' },
      maxOrders: { type: 'integer' },
      maxStorageMB: { type: 'integer' },
      customDomain: { type: 'boolean' },
      analytics: { type: 'boolean' },
      prioritySupport: { type: 'boolean' },
      removeBranding: { type: 'boolean' },
      apiAccess: { type: 'boolean' },
    },
    responses: {
      '201': { description: 'Plan created' },
    },
  },
  {
    path: '/api/v1/plans/:id',
    method: 'patch',
    tags: ['Plans'],
    summary: 'Update a plan (admin)',
    requiresAuth: true,
    params: {
      id: { type: 'string', description: 'Plan ID' },
    },
    responses: {
      '200': { description: 'Plan updated' },
    },
  },
  {
    path: '/api/v1/plans/:id',
    method: 'delete',
    tags: ['Plans'],
    summary: 'Delete a plan (admin)',
    requiresAuth: true,
    params: {
      id: { type: 'string', description: 'Plan ID' },
    },
    responses: {
      '200': { description: 'Plan deleted' },
    },
  },

  // Admin
  {
    path: '/api/v1/admin/dashboard',
    method: 'get',
    tags: ['Admin'],
    summary: 'Get admin dashboard stats',
    requiresAuth: true,
    responses: {
      '200': { description: 'Dashboard statistics' },
    },
  },
  {
    path: '/api/v1/admin/stores',
    method: 'get',
    tags: ['Admin'],
    summary: 'Get all stores',
    requiresAuth: true,
    query: {
      status: { type: 'string', description: 'Filter by status' },
      page: { type: 'integer', description: 'Page number' },
      limit: { type: 'integer', description: 'Items per page' },
    },
    responses: {
      '200': { description: 'List of all stores' },
    },
  },
  {
    path: '/api/v1/admin/stores/pending',
    method: 'get',
    tags: ['Admin'],
    summary: 'Get pending stores',
    requiresAuth: true,
    query: {
      page: { type: 'integer', description: 'Page number' },
      limit: { type: 'integer', description: 'Items per page' },
    },
    responses: {
      '200': { description: 'List of pending stores' },
    },
  },
  {
    path: '/api/v1/admin/stores/:id/approve',
    method: 'post',
    tags: ['Admin'],
    summary: 'Approve a store',
    requiresAuth: true,
    params: {
      id: { type: 'string', description: 'Store ID' },
    },
    requestBody: {
      planId: { type: 'string', description: 'Plan ID to assign' },
    },
    responses: {
      '200': { description: 'Store approved' },
    },
  },
  {
    path: '/api/v1/admin/stores/:id/reject',
    method: 'post',
    tags: ['Admin'],
    summary: 'Reject a store',
    requiresAuth: true,
    params: {
      id: { type: 'string', description: 'Store ID' },
    },
    responses: {
      '200': { description: 'Store rejected' },
    },
  },
  {
    path: '/api/v1/admin/stores/:id/suspend',
    method: 'post',
    tags: ['Admin'],
    summary: 'Suspend a store',
    requiresAuth: true,
    params: {
      id: { type: 'string', description: 'Store ID' },
    },
    responses: {
      '200': { description: 'Store suspended' },
    },
  },
  {
    path: '/api/v1/admin/users',
    method: 'get',
    tags: ['Admin'],
    summary: 'Get all users',
    requiresAuth: true,
    query: {
      role: { type: 'string', description: 'Filter by role' },
      page: { type: 'integer', description: 'Page number' },
      limit: { type: 'integer', description: 'Items per page' },
    },
    responses: {
      '200': { description: 'List of users' },
    },
  },
  {
    path: '/api/v1/admin/users/:id',
    method: 'get',
    tags: ['Admin'],
    summary: 'Get user details',
    requiresAuth: true,
    params: {
      id: { type: 'string', description: 'User ID' },
    },
    responses: {
      '200': { description: 'User details' },
    },
  },
  {
    path: '/api/v1/admin/subscriptions',
    method: 'get',
    tags: ['Admin'],
    summary: 'Get all subscriptions',
    requiresAuth: true,
    query: {
      status: { type: 'string', description: 'Filter by status' },
      page: { type: 'integer', description: 'Page number' },
      limit: { type: 'integer', description: 'Items per page' },
    },
    responses: {
      '200': { description: 'List of subscriptions' },
    },
  },
  {
    path: '/api/v1/admin/orders',
    method: 'get',
    tags: ['Admin'],
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
    path: '/api/v1/admin/subscriptions/:id',
    method: 'patch',
    tags: ['Admin'],
    summary: 'Update subscription (admin)',
    requiresAuth: true,
    params: {
      id: { type: 'string', description: 'Subscription ID' },
    },
    responses: {
      '200': { description: 'Subscription updated' },
    },
  },
  {
    path: '/api/v1/admin/subscriptions/:id/cancel',
    method: 'post',
    tags: ['Admin'],
    summary: 'Cancel subscription (admin)',
    requiresAuth: true,
    params: {
      id: { type: 'string', description: 'Subscription ID' },
    },
    responses: {
      '200': { description: 'Subscription cancelled' },
    },
  },

  // Store Subscriptions
  {
    path: '/api/v1/stores/:id/subscription',
    method: 'get',
    tags: ['Subscriptions'],
    summary: 'Get store subscription',
    requiresAuth: true,
    params: {
      id: { type: 'string', description: 'Store ID' },
    },
    responses: {
      '200': { description: 'Subscription details' },
      '404': { description: 'Subscription not found' },
    },
  },
  {
    path: '/api/v1/stores/:id/subscription/cancel',
    method: 'post',
    tags: ['Subscriptions'],
    summary: 'Cancel store subscription',
    requiresAuth: true,
    params: {
      id: { type: 'string', description: 'Store ID' },
    },
    responses: {
      '200': { description: 'Subscription cancelled' },
    },
  },
  {
    path: '/api/v1/stores/:id/subscription/upgrade',
    method: 'post',
    tags: ['Subscriptions'],
    summary: 'Upgrade store subscription',
    requiresAuth: true,
    params: {
      id: { type: 'string', description: 'Store ID' },
    },
    requestBody: {
      planId: { type: 'string' },
    },
    responses: {
      '200': { description: 'Subscription upgraded' },
    },
  },
  {
    path: '/api/v1/stores/:id/limits',
    method: 'get',
    tags: ['Subscriptions'],
    summary: 'Get store plan limits',
    requiresAuth: true,
    params: {
      id: { type: 'string', description: 'Store ID' },
    },
    responses: {
      '200': { description: 'Plan limits and usage' },
    },
  },
  {
    path: '/api/v1/stores/:storeId/products',
    method: 'get',
    tags: ['Stores'],
    summary: 'Get store products',
    params: {
      storeId: { type: 'string', description: 'Store ID' },
    },
    query: {
      categoryId: { type: 'string', description: 'Filter by category' },
      isActive: { type: 'boolean', description: 'Filter by active status' },
      page: { type: 'integer', description: 'Page number' },
      limit: { type: 'integer', description: 'Items per page' },
    },
    responses: {
      '200': { description: 'List of store products' },
    },
  },
  {
    path: '/api/v1/stores/:storeId/products',
    method: 'post',
    tags: ['Stores'],
    summary: 'Create product in store',
    description: 'Create a new product in the specified store. Subject to plan limits.',
    requiresAuth: true,
    params: {
      storeId: { type: 'string', description: 'Store ID' },
    },
    requestBody: {
      name: { type: 'string', description: 'Product name' },
      description: { type: 'string', description: 'Product description' },
      price: { type: 'number', description: 'Product price' },
      sku: { type: 'string', description: 'Product SKU' },
      inventory: { type: 'integer', description: 'Initial inventory count' },
      categoryId: { type: 'string', description: 'Category ID' },
      images: { type: 'array', items: { type: 'string' }, description: 'Product images' },
    },
    responses: {
      '201': { description: 'Product created successfully' },
      '400': { description: 'Validation error' },
      '402': { description: 'Product limit reached' },
      '403': { description: 'Not authorized' },
    },
  },
  {
    path: '/api/v1/stores/:storeId/orders',
    method: 'get',
    tags: ['Stores'],
    summary: 'Get store orders',
    requiresAuth: true,
    params: {
      storeId: { type: 'string', description: 'Store ID' },
    },
    query: {
      status: { type: 'string', description: 'Filter by order status' },
      page: { type: 'integer', description: 'Page number' },
      limit: { type: 'integer', description: 'Items per page' },
    },
    responses: {
      '200': { description: 'List of store orders' },
    },
  },
  // Payments
  {
    path: '/api/v1/payments/initiate',
    method: 'post',
    tags: ['Payments'],
    summary: 'Initiate a payment',
    requiresAuth: true,
    requestBody: {
      orderId: { type: 'string' },
      provider: { type: 'string', enum: ['STRIPE', 'SSLCOMMERZ', 'MANUAL'] },
      successUrl: { type: 'string', format: 'uri' },
      cancelUrl: { type: 'string', format: 'uri' },
      customerEmail: { type: 'string', format: 'email' },
    },
    responses: {
      '200': { description: 'Payment initiated' },
    },
  },
  {
    path: '/api/v1/payments/refund',
    method: 'post',
    tags: ['Payments'],
    summary: 'Refund a payment',
    requiresAuth: true,
    requestBody: {
      paymentId: { type: 'string' },
      amountCents: { type: 'integer' },
      reason: { type: 'string' },
    },
    responses: {
      '200': { description: 'Refund successful' },
    },
  },
  {
    path: '/api/v1/payments/webhooks/:provider',
    method: 'post',
    tags: ['Payments'],
    summary: 'Provider webhooks',
    params: {
      provider: { type: 'string', description: 'Payment provider (stripe, sslcommerz)' },
    },
    responses: {
      '200': { description: 'Webhook processed' },
    },
  },

  // Inventory
  {
    path: '/api/v1/inventory/locations',
    method: 'get',
    tags: ['Inventory'],
    summary: 'Get store locations',
    requiresAuth: true,
    responses: {
      '200': { description: 'List of locations' },
    },
  },
  {
    path: '/api/v1/inventory/locations',
    method: 'post',
    tags: ['Inventory'],
    summary: 'Create a location',
    requiresAuth: true,
    requestBody: {
      name: { type: 'string' },
      address: { type: 'string' },
      isDefault: { type: 'boolean' },
    },
    responses: {
      '201': { description: 'Location created' },
    },
  },
  {
    path: '/api/v1/inventory/levels',
    method: 'get',
    tags: ['Inventory'],
    summary: 'Get inventory levels for variant',
    requiresAuth: true,
    query: {
      variantId: { type: 'string', description: 'Variant ID' },
    },
    responses: {
      '200': { description: 'Inventory levels' },
    },
  },
  {
    path: '/api/v1/inventory/adjust',
    method: 'post',
    tags: ['Inventory'],
    summary: 'Adjust inventory level',
    requiresAuth: true,
    requestBody: {
      variantId: { type: 'string' },
      locationId: { type: 'string' },
      delta: { type: 'integer', description: 'Change in quantity' },
      reason: { type: 'string' },
    },
    responses: {
      '200': { description: 'Inventory adjusted' },
    },
  },

  // Webhooks
  {
    path: '/api/v1/webhooks',
    method: 'get',
    tags: ['Webhooks'],
    summary: 'Get registered webhooks',
    requiresAuth: true,
    responses: {
      '200': { description: 'List of webhooks' },
    },
  },
  {
    path: '/api/v1/webhooks',
    method: 'post',
    tags: ['Webhooks'],
    summary: 'Register a webhook',
    requiresAuth: true,
    requestBody: {
      topic: { type: 'string', description: 'Event topic (e.g. order.created)' },
      url: { type: 'string', format: 'uri' },
    },
    responses: {
      '201': { description: 'Webhook registered' },
    },
  },
  {
    path: '/api/v1/webhooks/:id',
    method: 'delete',
    tags: ['Webhooks'],
    summary: 'Delete a webhook',
    requiresAuth: true,
    params: {
      id: { type: 'string', description: 'Webhook ID' },
    },
    responses: {
      '200': { description: 'Webhook deleted' },
    },
  },

  // Themes
  {
    path: '/api/v1/themes/published',
    method: 'get',
    tags: ['Themes'],
    summary: 'Get published theme',
    description: 'Public storefront endpoint to get the currently active theme layout.',
    responses: {
      '200': { description: 'Theme data' },
    },
  },
  {
    path: '/api/v1/themes/store/:storeId',
    method: 'get',
    tags: ['Themes'],
    summary: 'List store themes',
    requiresAuth: true,
    params: {
      storeId: { type: 'string', description: 'Store ID' },
    },
    responses: {
      '200': { description: 'List of themes' },
    },
  },
  {
    path: '/api/v1/themes/:id',
    method: 'get',
    tags: ['Themes'],
    summary: 'Get theme details',
    requiresAuth: true,
    params: {
      id: { type: 'string', description: 'Theme ID' },
    },
    responses: {
      '200': { description: 'Theme with layout' },
    },
  },
  {
    path: '/api/v1/themes/store/:storeId',
    method: 'post',
    tags: ['Themes'],
    summary: 'Create theme',
    requiresAuth: true,
    params: {
      storeId: { type: 'string', description: 'Store ID' },
    },
    requestBody: {
      name: { type: 'string' },
      settings: { type: 'object' },
    },
    responses: {
      '201': { description: 'Theme created' },
    },
  },
  {
    path: '/api/v1/themes/:id/publish',
    method: 'post',
    tags: ['Themes'],
    summary: 'Publish theme',
    requiresAuth: true,
    params: {
      id: { type: 'string', description: 'Theme ID' },
    },
    responses: {
      '200': { description: 'Theme published' },
    },
  },

  // CMS
  {
    path: '/api/v1/cms/:storeId/theme',
    method: 'get',
    tags: ['CMS'],
    summary: 'Get theme settings',
    requiresAuth: true,
    params: {
      storeId: { type: 'string', description: 'Store ID' },
    },
    responses: {
      '200': { description: 'Theme settings' },
    },
  },
  {
    path: '/api/v1/cms/:storeId/pages',
    method: 'get',
    tags: ['CMS'],
    summary: 'List pages',
    requiresAuth: true,
    params: {
      storeId: { type: 'string', description: 'Store ID' },
    },
    responses: {
      '200': { description: 'List of pages' },
    },
  },
  {
    path: '/api/v1/cms/:storeId/navigation',
    method: 'get',
    tags: ['CMS'],
    summary: 'Get navigation menus',
    requiresAuth: true,
    params: {
      storeId: { type: 'string', description: 'Store ID' },
    },
    responses: {
      '200': { description: 'Navigation menus' },
    },
  },

  // Staff
  {
    path: '/api/v1/staff/:storeId',
    method: 'get',
    tags: ['Staff'],
    summary: 'List store staff',
    requiresAuth: true,
    params: {
      storeId: { type: 'string', description: 'Store ID' },
    },
    responses: {
      '200': { description: 'List of staff members' },
    },
  },
  {
    path: '/api/v1/staff/:storeId/invite',
    method: 'post',
    tags: ['Staff'],
    summary: 'Invite staff member',
    requiresAuth: true,
    params: {
      storeId: { type: 'string', description: 'Store ID' },
    },
    requestBody: {
      userId: { type: 'string' },
      role: { type: 'string', enum: ['MANAGER', 'EDITOR', 'SUPPORT'] },
    },
    responses: {
      '200': { description: 'Staff member added' },
    },
  },

  // Domains
  {
    path: '/api/v1/domains/check',
    method: 'get',
    tags: ['Domains'],
    summary: 'Check domain binding (Caddy)',
    query: {
      domain: { type: 'string', description: 'Hostname to check' },
    },
    responses: {
      '200': { description: 'Domain is bound' },
      '404': { description: 'Domain not bound' },
    },
  },
  {
    path: '/api/v1/domains/store/:storeId/request',
    method: 'post',
    tags: ['Domains'],
    summary: 'Request domain verification',
    requiresAuth: true,
    params: {
      storeId: { type: 'string', description: 'Store ID' },
    },
    requestBody: {
      hostname: { type: 'string' },
    },
    responses: {
      '200': { description: 'Verification requested' },
    },
  },

  // Assets
  {
    path: '/api/v1/assets/:storeId',
    method: 'get',
    tags: ['Assets'],
    summary: 'List store assets',
    requiresAuth: true,
    params: {
      storeId: { type: 'string', description: 'Store ID' },
    },
    responses: {
      '200': { description: 'List of assets' },
    },
  },
  {
    path: '/api/v1/assets/:storeId/upload',
    method: 'post',
    tags: ['Assets'],
    summary: 'Upload asset',
    requiresAuth: true,
    params: {
      storeId: { type: 'string', description: 'Store ID' },
    },
    responses: {
      '200': { description: 'Asset uploaded' },
      '402': { description: 'Storage limit exceeded' },
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
      { name: 'Storefront', description: 'Public storefront operations (Cart, Checkout)' },
      { name: 'Stores', description: 'Store management' },
      { name: 'Products', description: 'Product management' },
      { name: 'Orders', description: 'Order management' },
      { name: 'Reviews', description: 'Product reviews' },
      { name: 'Categories', description: 'Product categories' },
      { name: 'Themes', description: 'Theme and layout management' },
      { name: 'CMS', description: 'Content management (Pages, Navigation)' },
      { name: 'Plans', description: 'Subscription plans' },
      { name: 'Admin', description: 'Admin operations' },
      { name: 'Subscriptions', description: 'Store subscriptions' },
      { name: 'Staff', description: 'Store staff management' },
      { name: 'Payments', description: 'Payment processing' },
      { name: 'Inventory', description: 'Multi-location inventory' },
      { name: 'Domains', description: 'Custom domain management' },
      { name: 'Assets', description: 'Media asset management' },
      { name: 'Webhooks', description: 'Outbound webhooks' },
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
          schema: { type: param.type as OpenAPIV3.NonArraySchemaObjectType },
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
          schema: { type: param.type as OpenAPIV3.NonArraySchemaObjectType },
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
