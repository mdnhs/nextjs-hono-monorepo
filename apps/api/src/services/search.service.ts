import { MeiliSearch, Index } from 'meilisearch'

export interface SearchProduct {
  id: string
  storeId: string
  name: string
  description: string | null
  priceCents: number
  currency: string | null
  images: string[]
  sku: string
  categoryName: string | null
  isActive: boolean
}

class SearchService {
  private client: MeiliSearch | null = null
  private indexName = 'products'

  constructor() {
    const host = process.env.MEILISEARCH_HOST
    const apiKey = process.env.MEILISEARCH_API_KEY

    if (host && apiKey) {
      this.client = new MeiliSearch({ host, apiKey })
    }
  }

  private get index(): Index<SearchProduct> {
    if (!this.client) throw new Error('MeiliSearch not configured')
    return this.client.index(this.indexName)
  }

  async setup() {
    if (!this.client) return

    await this.index.updateSettings({
      searchableAttributes: ['name', 'description', 'sku', 'categoryName'],
      filterableAttributes: ['storeId', 'isActive', 'priceCents'],
      sortableAttributes: ['priceCents', 'createdAt'],
    })
  }

  async indexProduct(product: SearchProduct) {
    if (!this.client) return
    await this.index.addDocuments([product])
  }

  async deleteProduct(productId: string) {
    if (!this.client) return
    await this.index.deleteDocument(productId)
  }

  async searchProducts(storeId: string, query: string, options: any = {}) {
    if (!this.client) {
      // Fallback to basic DB search if MeiliSearch is not available
      return null
    }

    const filter = [`storeId = ${storeId}`, 'isActive = true']
    if (options.filter) filter.push(options.filter)

    return this.index.search(query, {
      ...options,
      filter,
    })
  }
}

export const searchService = new SearchService()
