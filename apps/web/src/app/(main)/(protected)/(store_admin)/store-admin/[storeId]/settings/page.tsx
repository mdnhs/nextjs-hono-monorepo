import { DomainManagement, StaffManagement } from '@/features/store-admin/components';
import { Separator } from '@/components/ui/separator';

interface StoreSettingsPageProps {
  params: {
    storeId: string;
  };
}

export default async function StoreSettingsPage({ params }: StoreSettingsPageProps) {
  const { storeId } = await params;
  
  return (
    <div className="space-y-10">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Store Settings</h1>
        <p className="text-muted-foreground">Manage your store's domain and team members.</p>
      </div>
      
      <DomainManagement storeId={storeId} />
      
      <Separator />
      
      <StaffManagement storeId={storeId} />
    </div>
  );
}
