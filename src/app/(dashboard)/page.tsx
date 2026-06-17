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
  Play,
  CheckCircle2,
  AlertCircle,
  ShieldCheck
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

        if (!orderData || !orderData.email) {
          updateProgress(current + 1);
          return;
        }

        try {
          addLog(`Processing order for ${orderData.email}...`, 'info');

          const response = await axios.post('/api/shopify/create-order', {
            shop: selectedStore.domain,
            accessToken: selectedStore.clientSecret,
            apiKey: selectedStore.clientId,
            orderData: orderData
          });

          if (response.data.success) {
            addLog(`Order #${response.data.order.name} created. Email sent to ${orderData.email}`, 'success');
            updateProgress(current + 1);
          } else {
            addLog(`Failed to create order for ${orderData.email}: ${response.data.error}`, 'error');
            updateProgress(current + 1);
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
    <div className="space-y-8 pb-10">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="bg-zinc-900 border-zinc-800 shadow-sm overflow-hidden relative group">
          <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:scale-110 transition-transform">
            <Store className="h-12 w-12 text-blue-500" />
          </div>
          <CardHeader className="pb-2">
            <CardTitle className="text-xs font-bold uppercase tracking-wider text-zinc-500">Active Stores</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-white">1 / 1</div>
            <p className="text-xs text-green-500 mt-1 font-medium flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-green-500" /> All systems online
            </p>
          </CardContent>
        </Card>

        <Card className="bg-zinc-900 border-zinc-800 shadow-sm overflow-hidden relative group">
          <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:scale-110 transition-transform">
            <ShoppingBag className="h-12 w-12 text-purple-500" />
          </div>
          <CardHeader className="pb-2">
            <CardTitle className="text-xs font-bold uppercase tracking-wider text-zinc-500">Total Orders</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-white">1,284</div>
            <p className="text-xs text-zinc-500 mt-1 font-medium">+20.4% from last month</p>
          </CardContent>
        </Card>

        <Card className="bg-zinc-900 border-zinc-800 shadow-sm overflow-hidden relative group">
          <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:scale-110 transition-transform">
            <Activity className="h-12 w-12 text-emerald-500" />
          </div>
          <CardHeader className="pb-2">
            <CardTitle className="text-xs font-bold uppercase tracking-wider text-zinc-500">Proxy Pool</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-white">42 / 50</div>
            <p className="text-xs text-emerald-500 mt-1 font-medium flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" /> 84% Health status
            </p>
          </CardContent>
        </Card>

        <Card className="bg-zinc-900 border-zinc-800 shadow-sm overflow-hidden relative group">
          <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:scale-110 transition-transform">
            <Clock className="h-12 w-12 text-orange-500" />
          </div>
          <CardHeader className="pb-2">
            <CardTitle className="text-xs font-bold uppercase tracking-wider text-zinc-500">Avg. Delay</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-white">{speed / 1000}s</div>
            <p className="text-xs text-zinc-500 mt-1 font-medium">Optimized for stability</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <Card className="lg:col-span-2 bg-zinc-900 border-zinc-800 shadow-xl overflow-hidden">
          <CardHeader className="border-b border-zinc-800/50 bg-zinc-900/50 pb-4">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-lg text-white font-bold">Automation Engine</CardTitle>
                <CardDescription className="text-zinc-500">Real-time processing status and logs</CardDescription>
              </div>
              <div className="flex items-center gap-2">
                {total > 0 && (
                  <>
                    <DropdownMenu>
                      <DropdownMenuTrigger
                        render={
                          <Button variant="outline" size="sm" className="bg-zinc-800 border-zinc-700 text-zinc-300 hover:bg-zinc-700 rounded-lg h-9">
                            {speed === 500 ? "Fast" : speed === 1000 ? "Normal" : "Slow"} <ChevronDown className="ml-2 h-4 w-4" />
                          </Button>
                        }
                      />
                      <DropdownMenuContent className="bg-zinc-900 border-zinc-800 text-zinc-300">
                        <DropdownMenuItem onClick={() => setSpeed(500)}>Fast (0.5s)</DropdownMenuItem>
                        <DropdownMenuItem onClick={() => setSpeed(1000)}>Normal (1.0s)</DropdownMenuItem>
                        <DropdownMenuItem onClick={() => setSpeed(2000)}>Slow (2.0s)</DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                    <Button 
                      size="sm" 
                      variant="outline" 
                      className={cn(
                        "h-9 w-9 p-0 rounded-lg",
                        isProcessing ? "text-yellow-500 border-yellow-500/20 bg-yellow-500/5" : "text-green-500 border-green-500/20 bg-green-500/5"
                      )}
                      onClick={isProcessing ? pauseProcess : () => useProcessStore.setState({ isProcessing: true })}
                    >
                      {isProcessing ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
                    </Button>
                    <Button 
                      size="sm" 
                      variant="outline" 
                      className="h-9 w-9 p-0 rounded-lg text-red-500 border-red-500/20 bg-red-500/5" 
                      onClick={stopProcess}
                    >
                      <Square className="h-4 w-4" />
                    </Button>
                  </>
                )}
              </div>
            </div>
          </CardHeader>
          <CardContent className="pt-8 space-y-8">
            <div className="space-y-4">
              <div className="flex justify-between items-end">
                <div className="space-y-1">
                  <h4 className="text-sm font-semibold text-zinc-300">
                    {total > 0 ? `Processing: ${selectedStore?.name}` : "Idle - No active jobs"}
                  </h4>
                  <p className="text-xs text-zinc-500">
                    {total > 0 ? `${current} of ${total} orders completed` : "Ready to start new batch"}
                  </p>
                </div>
                <div className="text-right">
                  <span className="text-2xl font-bold text-white">{progress}%</span>
                </div>
              </div>
              <Progress value={progress} className="h-3 bg-zinc-800 rounded-full overflow-hidden">
                <div className="h-full bg-blue-600 transition-all duration-500 ease-in-out shadow-[0_0_15px_rgba(37,99,235,0.4)]" />
              </Progress>
            </div>
            
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <div className={cn(
                  "w-2 h-2 rounded-full",
                  isProcessing ? "bg-green-500 animate-pulse" : "bg-zinc-700"
                )} />
                <span className="text-xs font-bold uppercase tracking-widest text-zinc-500">Live Console</span>
              </div>
              <div className="bg-zinc-950 rounded-xl border border-zinc-800 p-4 font-mono">
                <ScrollArea className="h-[250px] pr-4 text-[11px] leading-relaxed">
                  <div className="space-y-2">
                    {logs.length === 0 && <div className="text-zinc-600 italic">No activity logs recorded yet...</div>}
                    {logs.map((log) => (
                      <div key={log.id} className="flex gap-3 group">
                        <span className="text-zinc-700 shrink-0 font-medium">[{log.timestamp}]</span>
                        <span className={cn(
                          "transition-colors",
                          log.type === 'success' ? "text-emerald-400 group-hover:text-emerald-300" :
                          log.type === 'error' ? "text-rose-400 group-hover:text-rose-300" :
                          log.type === 'warning' ? "text-amber-400 group-hover:text-amber-300" :
                          "text-blue-400 group-hover:text-blue-300"
                        )}>
                          {log.message}
                        </span>
                      </div>
                    ))}
                  </div>
                </ScrollArea>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="space-y-8">
          <Card className="bg-zinc-900 border-zinc-800 shadow-xl overflow-hidden">
            <CardHeader className="border-b border-zinc-800/50 bg-zinc-900/50 pb-4">
              <CardTitle className="text-lg text-white font-bold">Statistics</CardTitle>
            </CardHeader>
            <CardContent className="pt-6">
              <div className="space-y-5">
                <div className="flex items-center justify-between p-3 rounded-xl bg-emerald-500/5 border border-emerald-500/10">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-emerald-500/20 flex items-center justify-center">
                      <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                    </div>
                    <span className="text-sm font-medium text-zinc-300">Success</span>
                  </div>
                  <Badge className="bg-emerald-500/20 text-emerald-500 border-none px-3 font-bold">
                    {logs.filter(l => l.type === 'success' && l.message.includes('created')).length}
                  </Badge>
                </div>
                
                <div className="flex items-center justify-between p-3 rounded-xl bg-rose-500/5 border border-rose-500/10">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-rose-500/20 flex items-center justify-center">
                      <AlertCircle className="w-4 h-4 text-rose-500" />
                    </div>
                    <span className="text-sm font-medium text-zinc-300">Failed</span>
                  </div>
                  <Badge className="bg-rose-500/20 text-rose-500 border-none px-3 font-bold">
                    {logs.filter(l => l.type === 'error').length}
                  </Badge>
                </div>
                
                <div className="flex items-center justify-between p-3 rounded-xl bg-blue-500/5 border border-blue-500/10">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-blue-500/20 flex items-center justify-center">
                      <Activity className="w-4 h-4 text-blue-500" />
                    </div>
                    <span className="text-sm font-medium text-zinc-300">In Progress</span>
                  </div>
                  <Badge className="bg-blue-500/20 text-blue-500 border-none px-3 font-bold">
                    {isProcessing ? 1 : 0}
                  </Badge>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-blue-600 to-indigo-700 border-none text-white shadow-2xl overflow-hidden relative">
            <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_30%_-20%,_rgba(255,255,255,0.2)_0%,_transparent_60%)]" />
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <ShieldCheck className="h-5 w-5" /> Pro Protection
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 relative z-10">
              <p className="text-xs text-blue-100 leading-relaxed font-medium">
                Your automation is secured with premium IP rotation and rate-limit protection.
              </p>
              <div className="pt-2">
                <div className="flex justify-between text-[10px] font-bold uppercase tracking-widest text-blue-200 mb-1.5">
                  <span>API Health</span>
                  <span>100%</span>
                </div>
                <div className="h-1.5 w-full bg-blue-900/40 rounded-full overflow-hidden">
                  <div className="h-full w-full bg-white rounded-full shadow-[0_0_10px_rgba(255,255,255,0.5)]" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
