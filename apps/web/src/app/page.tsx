import { formatPrice } from '@ecommerce/shared'
import type { Product } from '@ecommerce/types'

async function getProducts(): Promise<Product[]> {
  const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8787'
  try {
    const res = await fetch(`${apiUrl}/api/products`, {
      next: { revalidate: 60 },
    })
    if (!res.ok) return []
    const data = await res.json()
    return data.data
  } catch {
    return []
  }
}

export default async function Home() {
  const products = await getProducts()

  return (
    <main className="min-h-screen p-8">
      <div className="mx-auto max-w-7xl">
        <h1 className="mb-8 text-4xl font-bold">Products</h1>

        {products.length === 0 ? (
          <p className="text-gray-500">No products found.</p>
        ) : (
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {products.map((product) => (
              <div
                key={product.id}
                className="overflow-hidden rounded-lg border border-gray-200 bg-white shadow-sm"
              >
                {product.images[0] && (
                  <img
                    src={product.images[0]}
                    alt={product.name}
                    className="aspect-square w-full object-cover"
                  />
                )}
                <div className="p-4">
                  <h2 className="text-lg font-semibold">{product.name}</h2>
                  <p className="mt-1 text-sm text-gray-500">
                    {product.description}
                  </p>
                  <p className="mt-2 text-xl font-bold">
                    {formatPrice(product.price, product.currency)}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </main>
  )
}
