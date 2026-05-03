import { Button } from "@/components/ui/button";
import { Upload, FileIcon, ImageIcon, MoreVertical, HardDrive } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";

export default function AssetsGalleryPage() {
  const mockAssets = [
    { id: '1', name: 'hero-banner.jpg', type: 'IMAGE', size: '1.2 MB', url: '#' },
    { id: '2', name: 'product-01.png', type: 'IMAGE', size: '450 KB', url: '#' },
    { id: '3', name: 'terms.pdf', type: 'DOCUMENT', size: '120 KB', url: '#' },
    { id: '4', name: 'logo.svg', type: 'IMAGE', size: '15 KB', url: '#' },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Files & Assets</h1>
          <p className="text-muted-foreground">Upload and manage images and documents for your store.</p>
        </div>
        <Button>
          <Upload className="mr-2 h-4 w-4" /> Upload File
        </Button>
      </div>

      <Card className="bg-muted/50 border-none">
        <CardContent className="pt-6">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2 text-sm font-medium">
              <HardDrive className="h-4 w-4" />
              <span>Storage Usage</span>
            </div>
            <span className="text-sm text-muted-foreground">45.5 MB / 100 MB</span>
          </div>
          <Progress value={45.5} className="h-2" />
        </CardContent>
      </Card>

      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
        {mockAssets.map((asset) => (
          <Card key={asset.id} className="overflow-hidden group relative">
            <div className="aspect-square bg-muted flex items-center justify-center relative">
              {asset.type === 'IMAGE' ? (
                <div className="w-full h-full bg-slate-200 flex items-center justify-center">
                  <ImageIcon className="h-10 w-10 text-muted-foreground/50" />
                </div>
              ) : (
                <FileIcon className="h-10 w-10 text-muted-foreground/50" />
              )}
              <div className="absolute top-1 right-1 opacity-0 group-hover:opacity-100 transition-opacity">
                <Button variant="secondary" size="icon" className="h-7 w-7">
                  <MoreVertical className="h-4 w-4" />
                </Button>
              </div>
            </div>
            <CardContent className="p-2">
              <p className="text-xs font-medium truncate" title={asset.name}>{asset.name}</p>
              <p className="text-[10px] text-muted-foreground">{asset.size}</p>
            </CardContent>
          </Card>
        ))}
        
        {/* Upload Placeholder */}
        <button className="aspect-square rounded-lg border-2 border-dashed border-muted-foreground/25 flex flex-col items-center justify-center gap-2 hover:border-primary/50 hover:bg-muted/50 transition-all">
          <Plus className="h-6 w-6 text-muted-foreground" />
          <span className="text-xs font-medium text-muted-foreground">Add new</span>
        </button>
      </div>
    </div>
  );
}

// Re-importing Plus as it was used in placeholder
import { Plus } from "lucide-react";
