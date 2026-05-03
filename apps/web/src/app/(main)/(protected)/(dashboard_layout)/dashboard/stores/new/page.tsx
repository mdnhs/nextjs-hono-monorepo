'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { Store, UserCircle, Globe } from 'lucide-react';
import { storeService } from '@/services/store.service';

export default function CreateStorePage() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    slug: '',
    adminName: '',
    adminEmail: '',
    adminPassword: '',
  });

  const handleCreate = async () => {
    setLoading(true);
    try {
      const res = await storeService.createStore(formData);
      if (res.error) {
        toast.error(res.message || 'Failed to create store');
      } else {
        toast.success('Store and Admin user created successfully!');
        router.push('/dashboard');
      }
    } catch (error) {
      toast.error('Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto py-10">
      <div className="mb-8 flex items-center gap-4">
        <div className={`flex h-10 w-10 items-center justify-center rounded-full ${step >= 1 ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'}`}>1</div>
        <div className="h-px flex-1 bg-muted" />
        <div className={`flex h-10 w-10 items-center justify-center rounded-full ${step >= 2 ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'}`}>2</div>
      </div>

      {step === 1 ? (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Store className="h-5 w-5" /> Store Details
            </CardTitle>
            <CardDescription>Tell us about your new shop.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Store Name</Label>
              <Input 
                id="name" 
                placeholder="My Awesome Shop" 
                value={formData.name}
                onChange={(e) => setFormData({...formData, name: e.target.value})}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="slug">Store Slug (Subdomain)</Label>
              <div className="flex items-center gap-2">
                <Input 
                  id="slug" 
                  placeholder="my-shop" 
                  value={formData.slug}
                  onChange={(e) => setFormData({...formData, slug: e.target.value})}
                />
                <span className="text-muted-foreground">.localhost</span>
              </div>
            </div>
            <Button className="w-full mt-4" onClick={() => setStep(2)} disabled={!formData.name || !formData.slug}>
              Next: Admin User <Globe className="ml-2 h-4 w-4" />
            </Button>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <UserCircle className="h-5 w-5" /> Store Admin Account
            </CardTitle>
            <CardDescription>Create the first administrator for this store.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="adminName">Full Name</Label>
              <Input 
                id="adminName" 
                placeholder="John Doe" 
                value={formData.adminName}
                onChange={(e) => setFormData({...formData, adminName: e.target.value})}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="adminEmail">Email Address</Label>
              <Input 
                id="adminEmail" 
                type="email" 
                placeholder="admin@myshop.com" 
                value={formData.adminEmail}
                onChange={(e) => setFormData({...formData, adminEmail: e.target.value})}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="adminPassword">Password</Label>
              <Input 
                id="adminPassword" 
                type="password" 
                value={formData.adminPassword}
                onChange={(e) => setFormData({...formData, adminPassword: e.target.value})}
              />
            </div>
            <div className="flex gap-4 mt-4">
              <Button variant="outline" className="flex-1" onClick={() => setStep(1)}>Back</Button>
              <Button className="flex-[2]" onClick={handleCreate} disabled={loading || !formData.adminName || !formData.adminEmail || !formData.adminPassword}>
                {loading ? 'Creating...' : 'Create Store & Admin'}
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
