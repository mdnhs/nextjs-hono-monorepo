'use client';

import { useAssetList, useAssetMutations } from '@/hooks/api/query/use-assets';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Upload, File, Image as ImageIcon, Trash2, Search, MoreVertical, Copy } from 'lucide-react';
import { useState, useRef } from 'react';
import { Skeleton } from '@/components/ui/skeleton';
import { toast } from 'sonner';

interface AssetLibraryProps {
  storeId: string;
}

export function AssetLibrary({ storeId }: AssetLibraryProps) {
  const { data: response, isLoading } = useAssetList(storeId);
  const { uploadAsset } = useAssetMutations();
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const [search, setSearch] = useState('');
  const assets = response?.data || [];

  const handleUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      uploadAsset.mutate({ storeId, file });
    }
  };

  const copyUrl = (url: string) => {
    navigator.clipboard.writeText(url);
    toast.success('URL copied to clipboard');
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Media Library</h2>
          <p className="text-muted-foreground">Manage your store's images and files.</p>
        </div>
        <div className="flex gap-2">
          <input 
            type="file" 
            className="hidden" 
            ref={fileInputRef} 
            onChange={handleUpload}
          />
          <Button onClick={() => fileInputRef.current?.click()} disabled={uploadAsset.isPending}>
            <Upload className="mr-2 h-4 w-4" />
            Upload File
          </Button>
        </div>
      </div>

      <Card>
        <CardHeader className="pb-3">
          <div className="relative">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search assets..."
              className="pl-9"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="grid grid-cols-2 gap-4 md:grid-cols-4 lg:grid-cols-6">
              {[...Array(12)].map((_, i) => (
                <Skeleton key={i} className="aspect-square rounded-lg" />
              ))}
            </div>
          ) : assets.length === 0 ? (
            <div className="flex h-64 flex-col items-center justify-center rounded-lg border-2 border-dashed">
              <ImageIcon className="h-10 w-10 text-muted-foreground mb-2" />
              <p className="text-muted-foreground">No assets found.</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-4 md:grid-cols-4 lg:grid-cols-6">
              {assets.map((asset: any) => (
                <div key={asset.id} className="group relative aspect-square overflow-hidden rounded-lg border bg-muted">
                  {asset.type?.startsWith('image') ? (
                    <img 
                      src={asset.url} 
                      alt={asset.name} 
                      className="h-full w-full object-cover transition-transform group-hover:scale-105"
                    />
                  ) : (
                    <div className="flex h-full w-full flex-col items-center justify-center p-2">
                      <File className="h-10 w-10 text-muted-foreground mb-2" />
                      <span className="text-[10px] text-center line-clamp-2">{asset.name}</span>
                    </div>
                  )}
                  
                  <div className="absolute inset-0 bg-black/40 opacity-0 transition-opacity group-hover:opacity-100 flex items-center justify-center gap-2">
                    <Button size="icon" variant="secondary" className="h-8 w-8" onClick={() => copyUrl(asset.url)}>
                      <Copy className="h-4 w-4" />
                    </Button>
                    <Button size="icon" variant="destructive" className="h-8 w-8">
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
