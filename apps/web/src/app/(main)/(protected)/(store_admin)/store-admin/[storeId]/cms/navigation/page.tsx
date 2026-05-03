import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Plus, MoveVertical } from "lucide-react";

export default function NavigationManagerPage() {
  const menus = [
    { 
      name: 'Main Menu', 
      handle: 'main-menu',
      items: [
        { label: 'Home', url: '/' },
        { label: 'Catalog', url: '/collections/all' },
        { label: 'About', url: '/pages/about-us' },
      ]
    },
    { 
      name: 'Footer Menu', 
      handle: 'footer-menu',
      items: [
        { label: 'Search', url: '/search' },
        { label: 'Privacy Policy', url: '/pages/privacy-policy' },
        { label: 'Terms', url: '/pages/terms-of-service' },
      ]
    }
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Navigation</h1>
          <p className="text-muted-foreground">Manage your store's menus and link lists.</p>
        </div>
        <Button>
          <Plus className="mr-2 h-4 w-4" /> Create Menu
        </Button>
      </div>

      <div className="grid gap-6">
        {menus.map((menu) => (
          <Card key={menu.handle}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0">
              <div>
                <CardTitle>{menu.name}</CardTitle>
                <CardDescription>Handle: {menu.handle}</CardDescription>
              </div>
              <Button variant="outline" size="sm">Edit Menu</Button>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {menu.items.map((item, index) => (
                  <div key={index} className="flex items-center gap-3 p-3 rounded-md border bg-muted/30">
                    <MoveVertical className="h-4 w-4 text-muted-foreground cursor-grab" />
                    <div className="flex-1">
                      <p className="text-sm font-medium">{item.label}</p>
                      <p className="text-xs text-muted-foreground">{item.url}</p>
                    </div>
                  </div>
                ))}
                <Button variant="ghost" size="sm" className="w-full border-dashed border-2 mt-2">
                  <Plus className="mr-2 h-3 w-3" /> Add Menu Item
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
