'use client';

import { useDomainCheck, useDomainMutations } from '@/hooks/api/query/use-domains';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Globe, CheckCircle2, AlertCircle, RefreshCw, ExternalLink } from 'lucide-react';
import { useState } from 'react';
import { Badge } from '@/components/ui/badge';

interface DomainManagementProps {
  storeId: string;
  currentDomain?: string;
}

export function DomainManagement({ storeId, currentDomain }: DomainManagementProps) {
  const [hostname, setHostname] = useState(currentDomain || '');
  const { data: checkResponse, isLoading: isChecking, refetch } = useDomainCheck(hostname);
  const { requestVerification } = useDomainMutations();

  const isVerified = checkResponse?.data?.verified;

  const handleRequest = () => {
    requestVerification.mutate({ storeId, hostname });
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Custom Domain</CardTitle>
          <CardDescription>Connect your own domain to your store.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-2">
            <label className="text-sm font-medium">Domain Name</label>
            <div className="flex gap-2">
              <div className="relative flex-1">
                <Globe className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input 
                  placeholder="shop.yourdomain.com" 
                  className="pl-9"
                  value={hostname}
                  onChange={(e) => setHostname(e.target.value)}
                />
              </div>
              <Button variant="outline" onClick={() => refetch()} disabled={!hostname || isChecking}>
                <RefreshCw className={cn("h-4 w-4", isChecking && "animate-spin")} />
              </Button>
            </div>
          </div>

          {hostname && (
            <div className={cn(
              "rounded-lg border p-4 flex items-start gap-4",
              isVerified ? "bg-success/10 border-success/20" : "bg-warning/10 border-warning/20"
            )}>
              {isVerified ? (
                <CheckCircle2 className="h-5 w-5 text-success shrink-0" />
              ) : (
                <AlertCircle className="h-5 w-5 text-warning shrink-0" />
              )}
              <div className="flex-1 space-y-1">
                <div className="flex items-center gap-2">
                  <span className="font-semibold">{hostname}</span>
                  <Badge variant={isVerified ? "success" : "warning"}>
                    {isVerified ? "Connected" : "Not Verified"}
                  </Badge>
                </div>
                <p className="text-sm text-muted-foreground">
                  {isVerified 
                    ? "Your domain is properly configured and active."
                    : "To connect your domain, please add a CNAME record pointing to your app domain."}
                </p>
                {!isVerified && (
                  <div className="mt-4 space-y-2">
                    <div className="grid grid-cols-2 gap-2 text-xs border rounded p-2 bg-background">
                      <span className="text-muted-foreground font-medium uppercase">Type</span>
                      <span className="text-muted-foreground font-medium uppercase">Value</span>
                      <span>CNAME</span>
                      <span>{process.env.NEXT_PUBLIC_APP_DOMAIN || 'app.ecommerce.com'}</span>
                    </div>
                    <Button size="sm" onClick={handleRequest} disabled={requestVerification.isPending}>
                      Verify Connection
                    </Button>
                  </div>
                )}
              </div>
            </div>
          )}

          <div className="rounded-lg bg-muted p-4 space-y-2">
            <h4 className="text-sm font-semibold flex items-center gap-2">
              <ExternalLink className="h-4 w-4" />
              Need help?
            </h4>
            <p className="text-xs text-muted-foreground">
              Propagation can take up to 24-48 hours. If you've just updated your DNS, please wait before trying to verify again.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

import { cn } from '@/lib/utils';
