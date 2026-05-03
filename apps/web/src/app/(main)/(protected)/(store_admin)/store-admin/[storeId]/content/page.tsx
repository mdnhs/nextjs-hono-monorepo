import { InventoryManager } from '@/features/store-admin/components';

interface StoreContentPageProps {
  params: {
    storeId: string;
  };
}

export default async function StoreContentPage({ params }: StoreContentPageProps) {
  const { storeId } = await params;
  
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Inventory & Content</h1>
        <p className="text-muted-foreground">Manage your products and inventory levels.</p>
      </div>
      <InventoryManager storeId={storeId} />
    </div>
  );
}
