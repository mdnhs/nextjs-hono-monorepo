import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { IconChartBar } from '@tabler/icons-react';

export default function AnalyticsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className='text-2xl font-bold'>Platform Analytics</h1>
        <p className='text-sm text-muted-foreground'>Visualize platform growth and performance.</p>
      </div>
      
      <Card className="flex h-96 items-center justify-center border-dashed">
        <div className="text-center">
          <IconChartBar className="mx-auto h-12 w-12 text-muted-foreground/50" />
          <h3 className="mt-4 text-lg font-semibold">Analytics Dashboard</h3>
          <p className="text-sm text-muted-foreground">Advanced analytics visualization coming soon.</p>
        </div>
      </Card>
    </div>
  );
}
