"use client";

import { useState, useCallback } from "react";
import { useDropzone } from "react-dropzone";
import Papa from "papaparse";
import { 
  Upload, 
  FileText, 
  CheckCircle2, 
  ChevronRight, 
  Store, 
  Zap, 
  ClipboardList 
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { useStoreStore } from "@/store/useStoreStore";
import { useProcessStore } from "@/store/useProcessStore";
import { useRouter } from "next/navigation";

export default function BulkOrders() {
  const router = useRouter();
  const { stores } = useStoreStore();
  const { startProcess } = useProcessStore();
  
  const [step, setStep] = useState(1);
  const [csvData, setCsvData] = useState<any[]>([]);
  const [selectedAction, setSelectedAction] = useState<string | null>(null);
  const [selectedStoreId, setSelectedStoreId] = useState<string | null>(null);

  const onDrop = useCallback((acceptedFiles: File[]) => {
    const file = acceptedFiles[0];
    Papa.parse(file, {
      header: true,
      complete: (results) => {
        setCsvData(results.data);
      },
    });
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({ 
    onDrop,
    accept: { 'text/csv': ['.csv'] },
    multiple: false
  });

  const activeStores = stores.filter(s => s.status === "Token Active");

  const handleStageOrders = () => {
    if (csvData.length === 0 || !selectedStoreId) return;
    
    // Find the actual store object
    const store = selectedStoreId === 'all' 
      ? activeStores[0] // Simple round-robin start or handle 'all' logic in store
      : activeStores.find(s => s.id.toString() === selectedStoreId);

    if (!store) return;

    // Start the process in the global store with actual data and store info
    startProcess(csvData, store);
    
    // Redirect to dashboard to see progress
    router.push("/");
  };

  return (
    <div className="space-y-6">
      {/* Stepper */}
      <div className="flex items-center justify-center space-x-4 mb-8">
        {[1, 2, 3].map((s) => (
          <div key={s} className="flex items-center">
            <div className={cn(
              "w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold border-2 transition-colors",
              step === s ? "bg-primary text-primary-foreground border-primary" : 
              step > s ? "bg-green-500 text-white border-green-500" : "border-muted-foreground text-muted-foreground"
            )}>
              {step > s ? <CheckCircle2 className="w-6 h-6" /> : s}
            </div>
            {s < 3 && <div className={cn("w-20 h-0.5 mx-2", step > s ? "bg-green-500" : "bg-muted")} />}
          </div>
        ))}
      </div>

      {step === 1 && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card 
            className={cn("cursor-pointer hover:border-primary transition-all", selectedAction === 'full' && "border-primary ring-1 ring-primary")}
            onClick={() => setSelectedAction('full')}
          >
            <CardHeader>
              <Zap className="w-8 h-8 text-yellow-500 mb-2" />
              <CardTitle>Create + Fulfill</CardTitle>
              <CardDescription>Create order, mark fulfilled and notify customer.</CardDescription>
            </CardHeader>
          </Card>
          <Card 
            className={cn("cursor-pointer hover:border-primary transition-all", selectedAction === 'silent' && "border-primary ring-1 ring-primary")}
            onClick={() => setSelectedAction('silent')}
          >
            <CardHeader>
              <ClipboardList className="w-8 h-8 text-blue-500 mb-2" />
              <CardTitle>Batch Fulfill</CardTitle>
              <CardDescription>Create all first, then fulfill silently with auto address.</CardDescription>
            </CardHeader>
          </Card>
          <Card 
            className={cn("cursor-pointer hover:border-primary transition-all", selectedAction === 'draft' && "border-primary ring-1 ring-primary")}
            onClick={() => setSelectedAction('draft')}
          >
            <CardHeader>
              <FileText className="w-8 h-8 text-green-500 mb-2" />
              <CardTitle>Draft + Invoice</CardTitle>
              <CardDescription>Create draft orders and send invoices to customers.</CardDescription>
            </CardHeader>
          </Card>
          <div className="md:col-span-3 flex justify-end">
            <Button disabled={!selectedAction} onClick={() => setStep(2)}>
              Next Step <ChevronRight className="ml-2 w-4 h-4" />
            </Button>
          </div>
        </div>
      )}

      {step === 2 && (
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Select Store</CardTitle>
              <CardDescription>Choose target store or round-robin rotation</CardDescription>
            </CardHeader>
            <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Button 
                variant={selectedStoreId === 'all' ? 'default' : 'outline'} 
                className="h-20 justify-start gap-4 px-6"
                onClick={() => setSelectedStoreId('all')}
              >
                <div className="w-10 h-10 bg-accent rounded-full flex items-center justify-center">
                  <Store className="w-6 h-6" />
                </div>
                <div className="text-left">
                  <div className="font-bold">All Stores (Round-robin)</div>
                  <div className="text-xs opacity-70">Balance load across {activeStores.length} active stores</div>
                </div>
              </Button>
              
              {activeStores.map((store) => (
                <Button 
                  key={store.id}
                  variant={selectedStoreId === store.id.toString() ? 'default' : 'outline'} 
                  className="h-20 justify-start gap-4 px-6"
                  onClick={() => setSelectedStoreId(store.id.toString())}
                >
                  <div className="w-10 h-10 bg-accent rounded-full flex items-center justify-center">
                    <Store className="w-6 h-6" />
                  </div>
                  <div className="text-left">
                    <div className="font-bold">{store.name}</div>
                    <div className="text-xs opacity-70">{store.domain}</div>
                  </div>
                </Button>
              ))}

              {activeStores.length === 0 && (
                <div className="col-span-2 p-4 text-center border border-dashed rounded-lg text-muted-foreground">
                  No active stores found. Please connect and test a store first.
                </div>
              )}
            </CardContent>
          </Card>
          <div className="flex justify-between">
            <Button variant="ghost" onClick={() => setStep(1)}>Back</Button>
            <Button disabled={!selectedStoreId} onClick={() => setStep(3)}>
              Next Step <ChevronRight className="ml-2 w-4 h-4" />
            </Button>
          </div>
        </div>
      )}

      {step === 3 && (
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Upload CSV</CardTitle>
                  <CardDescription>Drag and drop your order data file</CardDescription>
                </div>
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={() => {
                    const csvContent = "email,first_name,last_name,phone,product_name,product_price,quantity,address1,city,province,zip,country\ntest@example.com,John,Doe,123456789,Shopify T-Shirt,25.00,1,123 Main St,New York,NY,10001,US";
                    const blob = new Blob([csvContent], { type: 'text/csv' });
                    const url = window.URL.createObjectURL(blob);
                    const a = document.createElement('a');
                    a.setAttribute('hidden', '');
                    a.setAttribute('href', url);
                    a.setAttribute('download', 'shopify_bulk_orders_sample.csv');
                    document.body.appendChild(a);
                    a.click();
                    document.body.removeChild(a);
                  }}
                >
                  <FileText className="w-4 h-4 mr-2" /> Download Sample CSV
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div 
                {...getRootProps()} 
                className={cn(
                  "border-2 border-dashed rounded-xl p-12 text-center cursor-pointer transition-colors",
                  isDragActive ? "border-primary bg-primary/5" : "border-muted-foreground/25 hover:border-primary/50"
                )}
              >
                <input {...getInputProps()} />
                <Upload className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-semibold">Click or drag CSV here</h3>
                <p className="text-sm text-muted-foreground mt-1">Supports standard Shopify order export format</p>
              </div>

              {csvData.length > 0 && (
                <div className="mt-8">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="font-semibold flex items-center gap-2">
                      Parsed Data <Badge variant="secondary">{csvData.length} rows</Badge>
                    </h3>
                  </div>
                  <div className="border rounded-md">
                    <ScrollArea className="h-[400px]">
                      <Table>
                        <TableHeader>
                          <TableRow>
                            {Object.keys(csvData[0]).map((header) => (
                              <TableHead key={header} className="whitespace-nowrap">{header}</TableHead>
                            ))}
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {csvData.map((row, i) => (
                            <TableRow key={i}>
                              {Object.values(row).map((val: any, j) => (
                                <TableCell key={j} className="whitespace-nowrap max-w-[200px] truncate">
                                  {val}
                                </TableCell>
                              ))}
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </ScrollArea>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
          <div className="flex justify-between">
            <Button variant="ghost" onClick={() => setStep(2)}>Back</Button>
            <Button 
              disabled={csvData.length === 0} 
              size="lg" 
              className="bg-green-600 hover:bg-green-700"
              onClick={handleStageOrders}
            >
              Stage {csvData.length} Orders <Zap className="ml-2 w-4 h-4" />
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
