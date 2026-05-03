import { AssetLibrary } from '@/features/store-admin/components';

interface StoreCMSPageProps {
  params: {
    storeId: string;
  };
}

export default async function StoreCMSPage({ params }: StoreCMSPageProps) {
  const { storeId } = await params;
  
  return (
    <div className="space-y-10">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Store Design & CMS</h1>
        <p className="text-muted-foreground">Manage your store's appearance and media assets.</p>
      </div>
      
      {/* 
        In a complete implementation, this would also include theme selection, 
        navigation management, and page building components.
      */}
      
      <AssetLibrary storeId={storeId} />
    </div>
  );
}
