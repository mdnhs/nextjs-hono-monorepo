import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";

export default function PagesManagerPage() {
  const mockPages = [
    { id: '1', title: 'About Us', slug: 'about-us', status: 'Published', updatedAt: '2026-05-01' },
    { id: '2', title: 'Privacy Policy', slug: 'privacy-policy', status: 'Published', updatedAt: '2026-04-15' },
    { id: '3', title: 'Terms of Service', slug: 'terms-of-service', status: 'Draft', updatedAt: '2026-05-02' },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Pages</h1>
          <p className="text-muted-foreground">Manage custom pages like About Us, FAQs, and Policies.</p>
        </div>
        <Button>
          <Plus className="mr-2 h-4 w-4" /> Add Page
        </Button>
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Title</TableHead>
              <TableHead>Slug</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Last Updated</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {mockPages.map((page) => (
              <TableRow key={page.id}>
                <TableCell className="font-medium">{page.title}</TableCell>
                <TableCell className="text-muted-foreground">/{page.slug}</TableCell>
                <TableCell>
                  <Badge variant={page.status === 'Published' ? 'default' : 'secondary'}>
                    {page.status}
                  </Badge>
                </TableCell>
                <TableCell>{page.updatedAt}</TableCell>
                <TableCell className="text-right">
                  <Button variant="ghost" size="sm">Edit</Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
