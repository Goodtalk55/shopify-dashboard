import { 
  ShieldCheck, 
  Plus, 
  Upload, 
  Trash2, 
  Activity,
  CheckCircle2,
  AlertCircle
} from "lucide-react";
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

const proxies = [
  { id: 1, ip: "192.168.1.1", port: "8080", user: "admin", status: "Active", latency: "120ms" },
  { id: 2, ip: "192.168.1.2", port: "8080", user: "admin", status: "Active", latency: "150ms" },
  { id: 3, ip: "192.168.1.3", port: "8080", user: "admin", status: "Inactive", latency: "N/A" },
];

export default function ProxiesPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Proxy Settings</h1>
          <p className="text-muted-foreground">Manage your proxy rotation for anonymous Shopify API calls.</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" className="gap-2">
            <Upload className="h-4 w-4" /> Bulk Upload CSV
          </Button>
          <Dialog>
            <DialogTrigger
              render={
                <Button className="gap-2">
                  <Plus className="h-4 w-4" /> Add Single Proxy
                </Button>
              }
            />
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Add Proxy</DialogTitle>
                <DialogDescription>Enter the proxy details manually.</DialogDescription>
              </DialogHeader>
              <div className="grid grid-cols-2 gap-4 py-4">
                <div className="grid gap-2">
                  <Label htmlFor="ip">IP Address</Label>
                  <Input id="ip" placeholder="0.0.0.0" />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="port">Port</Label>
                  <Input id="port" placeholder="8080" />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="user">Username (Optional)</Label>
                  <Input id="user" placeholder="user123" />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="pass">Password (Optional)</Label>
                  <Input id="pass" type="password" placeholder="******" />
                </div>
              </div>
              <DialogFooter>
                <Button type="submit">Add Proxy</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Proxy List</CardTitle>
            <CardDescription>All proxies added to the rotation pool.</CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>IP Address</TableHead>
                  <TableHead>Port</TableHead>
                  <TableHead>Username</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Latency</TableHead>
                  <TableHead className="text-right">Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {proxies.map((proxy) => (
                  <TableRow key={proxy.id}>
                    <TableCell className="font-mono">{proxy.ip}</TableCell>
                    <TableCell>{proxy.port}</TableCell>
                    <TableCell>{proxy.user}</TableCell>
                    <TableCell>
                      <Badge variant={proxy.status === 'Active' ? 'outline' : 'destructive'} className={proxy.status === 'Active' ? 'bg-green-500/10 text-green-500 border-green-500/20' : ''}>
                        {proxy.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-muted-foreground">{proxy.latency}</TableCell>
                    <TableCell className="text-right">
                      <Button variant="ghost" size="icon" className="text-destructive hover:text-destructive hover:bg-destructive/10">
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        <div className="space-y-6">
          <Card className="bg-primary/5 border-primary/20">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <ShieldCheck className="h-5 w-5 text-primary" /> How it works
              </CardTitle>
            </CardHeader>
            <CardContent className="text-sm space-y-4">
              <p>
                Our system automatically rotates between your active proxies for every request made to Shopify.
              </p>
              <ul className="list-disc pl-4 space-y-2 text-muted-foreground">
                <li>Prevents IP rate limiting</li>
                <li>Reduces bot detection risk</li>
                <li>Automatic failover if proxy dies</li>
                <li>Configurable timeout and retries</li>
              </ul>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Pool Statistics</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Total Proxies</span>
                <span className="font-bold">50</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Active Pool</span>
                <span className="font-bold text-green-500">42</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Avg. Latency</span>
                <span className="font-bold">135ms</span>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
