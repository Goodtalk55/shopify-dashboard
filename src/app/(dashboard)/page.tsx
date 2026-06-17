"use client";

import { useEffect, useRef } from "react";
import { 
  Activity, 
  Store, 
  ShoppingBag, 
  Clock, 
  Pause, 
  Square, 
  ChevronDown,
  Play
} from "lucide-react";
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useProcessStore } from "@/store/useProcessStore";
import { cn } from "@/lib/utils";
import axios from "axios";

export default function Dashboard() {
  const { 
    isProcessing, 
    progress, 
    total, 
    current, 
    logs, 
    speed,
    csvData,
    selectedStore,
    startProcess,
    pauseProcess,
    stopProcess,
    addLog,
    updateProgress,
    setSpeed
  } = useProcessStore();

  const timerRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    const processNextOrder = async () => {
      if (isProcessing && current < total) {
        const orderData = csvData[current];

        // Skip empty rows if any
        if (!orderData || !orderData.email) {
          updateProgress(current + 1);
          return;
        }

        try {
          addLog(`Processing order for ${orderData.email}...`, 'info');

          const response = await axios.post('/api/shopify/create-order', {
            shop: selectedStore.domain,
            accessToken: selectedStore.clientSecret, // In this demo, we use clientSecret as accessToken
            apiKey: selectedStore.clientId,
            orderData: orderData
          });

          if (response.data.success) {
            addLog(`Order #${response.data.order.name} created. Email sent to ${orderData.email}`, 'success');
            updateProgress(current + 1);
          } else {
            addLog(`Failed to create order for ${orderData.email}: ${response.data.error}`, 'error');
            updateProgress(current + 1); // Skip and continue
          }
        } catch (error: any) {
          addLog(`API Error for ${orderData.email}: ${error.response?.data?.error || error.message}`, 'error');
          updateProgress(current + 1);
        }

        if (current + 1 === total) {
          addLog("Batch processing complete!", 'success');
          pauseProcess();
        }
      }
    };

    if (isProcessing) {
      timerRef.current = setTimeout(processNextOrder, speed);
    }

    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [isProcessing, current, total, speed, csvData, selectedStore, updateProgress, addLog, pauseProcess]);

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Active Stores</CardTitle>
            <Store className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">1/1</div>
            <p className="text-xs text-muted-foreground">Connected stores</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Total Orders</CardTitle>
            <ShoppingBag className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">1,284</div>
            <p className="text-xs text-muted-foreground">+20% from last month</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Active Proxies</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">42/50</div>
            <p className="text-xs text-muted-foreground">Operational status</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Avg. Processing Time</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{speed / 1000}s</div>
            <p className="text-xs text-muted-foreground">Per order</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Processing Jobs</CardTitle>
                <CardDescription>Real-time automation status</CardDescription>
              </div>
              <div className="flex items-center gap-2">
                {total > 0 && (
                  <>
                    <DropdownMenu>
                      <DropdownMenuTrigger
                        render={
                          <Button variant="outline" size="sm" className="gap-2">
                            {speed === 500 ? "Fast (0.5s)" : speed === 1000 ? "Normal (1s)" : "Slow (2s)"} <ChevronDown className="h-4 w-4" />
                          </Button>
                        }
                      />
                      <DropdownMenuContent>
                        <DropdownMenuItem onClick={() => setSpeed(500)}>Fast (0.5s)</DropdownMenuItem>
                        <DropdownMenuItem onClick={() => setSpeed(1000)}>Normal (1s)</DropdownMenuItem>
                        <DropdownMenuItem onClick={() => setSpeed(2000)}>Slow (2s)</DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                    <Button 
                      size="sm" 
                      variant="outline" 
                      className="text-yellow-500"
                      onClick={isProcessing ? pauseProcess : () => useProcessStore.setState({ isProcessing: true })}
                    >
                      {isProcessing ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
                    </Button>
                    <Button size="sm" variant="outline" className="text-red-500" onClick={stopProcess}>
                      <Square className="h-4 w-4" />
                    </Button>
                  </>
                )}
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="font-medium">
                  {total > 0 ? `Batch Processing - ${selectedStore?.name}` : "No active jobs"}
                </span>
                <span className="text-muted-foreground">{progress}% ({current}/{total})</span>
              </div>
              <Progress value={progress} className="h-2" />
            </div>
            
            <div className="border rounded-md">
              <div className="bg-muted p-2 text-xs font-mono flex items-center gap-2 border-b">
                <div className={cn("w-2 h-2 rounded-full", isProcessing ? "bg-green-500 animate-pulse" : "bg-yellow-500")} />
                LIVE_ACTIVITY_LOG
              </div>
              <ScrollArea className="h-[300px] p-3 font-mono text-xs">
                <div className="space-y-1">
                  {logs.length === 0 && <div className="text-muted-foreground italic">Waiting for activity...</div>}
                  {logs.map((log) => (
                    <div key={log.id} className="flex gap-2">
                      <span className="text-muted-foreground text-[10px] w-16">[{log.timestamp}]</span>
                      <span className={cn(
                        log.type === 'success' ? "text-green-500" :
                        log.type === 'error' ? "text-red-500" :
                        log.type === 'warning' ? "text-yellow-500" :
                        "text-blue-500"
                      )}>
                        {log.message}
                      </span>
                    </div>
                  ))}
                </div>
              </ScrollArea>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Orders by Status</CardTitle>
            <CardDescription>Current batch distribution</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-green-500" />
                  <span className="text-sm">Success</span>
                </div>
                <Badge variant="secondary">{logs.filter(l => l.type === 'success' && l.message.includes('created')).length}</Badge>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-red-500" />
                  <span className="text-sm">Failed</span>
                </div>
                <Badge variant="secondary">{logs.filter(l => l.type === 'error').length}</Badge>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-yellow-500" />
                  <span className="text-sm">Processing</span>
                </div>
                <Badge variant="secondary">{isProcessing ? 1 : 0}</Badge>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
