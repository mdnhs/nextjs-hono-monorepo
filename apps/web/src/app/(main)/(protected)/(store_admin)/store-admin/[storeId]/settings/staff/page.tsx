import { Button } from "@/components/ui/button";
import { Plus, UserPlus, Shield, Mail } from "lucide-react";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export default function StaffManagementPage() {
  const mockStaff = [
    { id: '1', name: 'Alice Smith', email: 'alice@example.com', role: 'MANAGER', status: 'Active' },
    { id: '2', name: 'Bob Johnson', email: 'bob@example.com', role: 'EDITOR', status: 'Active' },
    { id: '3', name: 'Charlie Brown', email: 'charlie@example.com', role: 'SUPPORT', status: 'Pending' },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Staff Accounts</h1>
          <p className="text-muted-foreground">Manage who has access to your store and what they can do.</p>
        </div>
        <Button>
          <UserPlus className="mr-2 h-4 w-4" /> Invite Staff
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Total Staff</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">3 / 5</div>
            <p className="text-xs text-muted-foreground">Based on your current plan</p>
          </CardContent>
        </Card>
      </div>

      <div className="rounded-md border bg-card">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>User</TableHead>
              <TableHead>Role</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {mockStaff.map((staff) => (
              <TableRow key={staff.id}>
                <TableCell>
                  <div className="flex flex-col">
                    <span className="font-medium">{staff.name}</span>
                    <span className="text-xs text-muted-foreground">{staff.email}</span>
                  </div>
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-2">
                    <Shield className="h-3 w-3 text-muted-foreground" />
                    <span className="text-sm">{staff.role}</span>
                  </div>
                </TableCell>
                <TableCell>
                  <Badge variant={staff.status === 'Active' ? 'default' : 'secondary'}>
                    {staff.status}
                  </Badge>
                </TableCell>
                <TableCell className="text-right">
                  <Button variant="ghost" size="sm">Manage</Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
