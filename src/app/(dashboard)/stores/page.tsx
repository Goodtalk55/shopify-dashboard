"use client";

import { useState, useEffect } from "react";
import { 
  Store, 
  Plus, 
  RefreshCw, 
  ExternalLink, 
  Pause, 
  Play,
  Edit, 
  Trash2,
  CheckCircle2,
  AlertCircle,
  Key
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
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import { useStoreStore, ShopifyStore } from "@/store/useStoreStore";
import axios from "axios";

export default function StoresManagement() {
  const { stores, addStore, updateStore, deleteStore, togglePause } = useStoreStore();
  
  const [open, setOpen] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [testingId, setTestingId] = useState<number | null>(null);
  
  const [formData, setFormData] = useState({
    name: "",
    domain: "",
    clientId: "",
    clientSecret: ""
  });

  // Handle OAuth Callback
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const code = urlParams.get('code');
    const shop = urlParams.get('shop');
    const storeId = urlParams.get('state');

    if (code && shop && storeId) {
      const exchangeToken = async () => {
        const store = stores.find(s => s.id.toString() === storeId);
        if (!store) return;

        try {
          const response = await axios.post('/api/shopify/exchange-token', {
            shop,
            code,
            clientId: store.clientId,
            clientSecret: store.clientSecret
          });

          if (response.data.success) {
            updateStore(store.id, {
              clientSecret: response.data.accessToken, // Save the actual shpat_ token
              status: "Token Active",
              expiry: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
            });
            // Clean URL
            window.history.replaceState({}, document.title, "/stores");
          }
        } catch (error) {
          console.error("Token exchange failed", error);
        }
      };
      exchangeToken();
    }
  }, [stores, updateStore]);

  // Handle Hydration
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  const handleGenerateToken = (store: ShopifyStore) => {
    if (!store.clientId) {
      alert("Please enter a Client ID first.");
      return;
    }

    const scopes = "write_orders,read_orders,write_customers,read_customers,write_products,read_products";
    const redirectUri = `${window.location.origin}/api/shopify/callback`;
    const authUrl = `https://${store.domain}/admin/oauth/authorize?client_id=${store.clientId}&scope=${scopes}&redirect_uri=${redirectUri}&state=${store.id}`;
    
    window.location.href = authUrl;
  };

  const handleOpenDialog = (store?: ShopifyStore) => {
    if (store) {
      setEditMode(true);
      setEditingId(store.id);
      setFormData({
        name: store.name,
        domain: store.domain,
        clientId: store.clientId || "",
        clientSecret: store.clientSecret || ""
      });
    } else {
      setEditMode(false);
      setEditingId(null);
      setFormData({ name: "", domain: "", clientId: "", clientSecret: "" });
    }
    setOpen(true);
  };

  const handleSubmit = () => {
    if (!formData.name || !formData.domain) return;
    
    const domain = formData.domain.includes('.myshopify.com') 
      ? formData.domain.trim() 
      : `${formData.domain.trim()}.myshopify.com`;

    if (editMode && editingId) {
      updateStore(editingId, { ...formData, domain });
    } else {
      addStore({ ...formData, domain });
    }
    
    setOpen(false);
  };

  const handleTestConnection = async (id: number) => {
    const store = stores.find(s => s.id === id);
    if (!store) return;

    // IF the token is NOT a permanent access token (shpat_), 
    // we need to generate one first using OAuth.
    if (!store.clientSecret?.startsWith('shpat_')) {
      handleGenerateToken(store);
      return;
    }

    setTestingId(id);
    
    try {
      const response = await axios.post('/api/shopify/test-connection', {
        shop: store.domain,
        accessToken: store.clientSecret,
        apiKey: store.clientId
      });

      if (response.data.success) {
        updateStore(id, {
          status: "Token Active",
          expiry: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
        });
      } else {
        updateStore(id, {
          status: "Connection Failed",
          expiry: response.data.error || "API Error"
        });
      }
    } catch (error: any) {
      updateStore(id, {
        status: "Connection Failed",
        expiry: error.response?.data?.error || error.message
      });
    } finally {
      setTestingId(null);
    }
  };

  if (!mounted) return null;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Stores</h1>
          <p className="text-muted-foreground">Manage your connected Shopify stores and API credentials.</p>
        </div>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger
            render={
              <Button className="gap-2" onClick={() => handleOpenDialog()}>
                <Plus className="h-4 w-4" /> Add New Store
              </Button>
            }
          />
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>{editMode ? "Edit Store" : "Add New Store"}</DialogTitle>
              <DialogDescription>
                Enter your Shopify store details and API credentials.
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="name">Store Name</Label>
                <Input 
                  id="name" 
                  placeholder="e.g. My Awesome Shop" 
                  value={formData.name}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="domain">Shop Domain</Label>
                <Input 
                  id="domain" 
                  placeholder="xxx.myshopify.com" 
                  value={formData.domain}
                  onChange={(e) => setFormData({...formData, domain: e.target.value})}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="client-id">API Key (Client ID)</Label>
                <Input 
                  id="client-id" 
                  placeholder="Paste API Key" 
                  value={formData.clientId}
                  onChange={(e) => setFormData({...formData, clientId: e.target.value})}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="client-secret">Admin API Access Token</Label>
                <Input 
                  id="client-secret" 
                  type="password" 
                  placeholder="shpat_xxxxxxxxxxxxxxxx" 
                  value={formData.clientSecret}
                  onChange={(e) => setFormData({...formData, clientSecret: e.target.value})}
                />
              </div>
            </div>
            <DialogFooter>
              <Button onClick={handleSubmit}>{editMode ? "Update Store" : "Save Store"}</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Connected Stores</CardTitle>
          <CardDescription>A list of all Shopify stores currently connected to your account.</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Store Name</TableHead>
                <TableHead>Domain</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Expiry / Info</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {stores.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-10 text-muted-foreground">
                    No stores connected yet.
                  </TableCell>
                </TableRow>
              ) : (
                stores.map((store) => (
                  <TableRow key={store.id} className={cn(store.isPaused && "opacity-60")}>
                    <TableCell className="font-medium">
                      <div className="flex items-center gap-2">
                        <Store className="h-4 w-4 text-primary" />
                        {store.name}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1 text-muted-foreground">
                        {store.domain}
                        <ExternalLink className="h-3 w-3" />
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge 
                        variant="outline" 
                        className={cn(
                          "gap-1",
                          store.isPaused ? "bg-slate-500/10 text-slate-500 border-slate-500/20" :
                          store.status === "Token Active" ? "bg-green-500/10 text-green-500 border-green-500/20" :
                          store.status === "Connection Failed" ? "bg-red-500/10 text-red-500 border-red-500/20" :
                          "bg-yellow-500/10 text-yellow-500 border-yellow-500/20"
                        )}
                      >
                        {store.isPaused ? <Pause className="h-3 w-3" /> : store.status === "Token Active" ? <CheckCircle2 className="h-3 w-3" /> : <AlertCircle className="h-3 w-3" />}
                        {store.isPaused ? "Paused" : store.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-muted-foreground text-xs">{store.expiry}</TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-1">
                        <Button 
                          variant="ghost" 
                          size="icon-sm" 
                          title="Generate Token Automatically"
                          onClick={() => handleGenerateToken(store)}
                        >
                          <Key className="h-4 w-4 text-blue-500" />
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="icon-sm" 
                          title="Test Connection"
                          onClick={() => handleTestConnection(store.id)}
                          disabled={testingId === store.id || store.isPaused}
                        >
                          <RefreshCw className={cn("h-4 w-4", testingId === store.id && "animate-spin")} />
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="icon-sm" 
                          title={store.isPaused ? "Activate Store" : "Pause Store"}
                          onClick={() => togglePause(store.id)}
                        >
                          {store.isPaused ? <Play className="h-4 w-4 text-green-500" /> : <Pause className="h-4 w-4 text-yellow-500" />}
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="icon-sm" 
                          title="Edit"
                          onClick={() => handleOpenDialog(store)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="icon-sm" 
                          className="text-destructive hover:text-destructive hover:bg-destructive/10" 
                          title="Delete"
                          onClick={() => deleteStore(store.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
