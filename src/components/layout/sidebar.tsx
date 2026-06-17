import Link from "next/link";
import { usePathname } from "next/navigation";
import { 
  LayoutDashboard, 
  Store, 
  ClipboardList, 
  ShieldCheck, 
  Link2, 
  History, 
  UserCircle,
  LogOut,
  Menu
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";

import { signOut } from "next-auth/react";

const sidebarItems = [
  { name: "Dashboard", href: "/", icon: LayoutDashboard },
  { name: "Stores", href: "/stores", icon: Store },
  { name: "Bulk Orders", href: "/bulk-orders", icon: ClipboardList },
  { name: "Proxy Settings", href: "/proxies", icon: ShieldCheck },
  { name: "Activity Logs", href: "/logs", icon: History },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <div className="flex flex-col h-full bg-zinc-950 border-r border-zinc-800/50 text-zinc-400">
      <div className="p-6">
        <h1 className="text-xl font-bold tracking-tight flex items-center gap-3 text-white">
          <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center text-white shadow-lg shadow-blue-900/20">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <span className="hidden lg:inline bg-clip-text text-transparent bg-gradient-to-r from-white to-zinc-500">GV Auto</span>
        </h1>
      </div>
      <ScrollArea className="flex-1 px-4">
        <nav className="space-y-1.5">
          {sidebarItems.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.name}
                href={item.href}
                className={cn(
                  "flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200 group",
                  isActive 
                    ? "bg-blue-600/10 text-blue-400 border border-blue-500/20" 
                    : "hover:bg-zinc-900 hover:text-white"
                )}
              >
                <item.icon className={cn(
                  "w-5 h-5 transition-transform duration-200 group-hover:scale-110",
                  isActive ? "text-blue-500" : "text-zinc-500"
                )} />
                <span className="hidden lg:inline font-medium text-sm">{item.name}</span>
                {isActive && <div className="hidden lg:block ml-auto w-1.5 h-1.5 rounded-full bg-blue-500 shadow-[0_0_8px_rgba(59,130,246,0.5)]" />}
              </Link>
            );
          })}
        </nav>
      </ScrollArea>
      <div className="p-4 mt-auto">
        <div className="bg-zinc-900/50 rounded-2xl border border-zinc-800/50 p-3 mb-4 hidden lg:block">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
            <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-500">System Status</span>
          </div>
          <p className="text-xs text-zinc-400">All systems operational</p>
        </div>
        <Separator className="mb-4 bg-zinc-800/50" />
        <div className="flex flex-col gap-1">
          <Button 
            variant="ghost" 
            className="justify-start gap-3 w-full rounded-xl hover:bg-zinc-900 text-zinc-400 hover:text-white transition-all"
            onClick={() => signOut()}
          >
            <LogOut className="w-5 h-5 text-red-500/70" />
            <span className="hidden lg:inline text-sm font-medium">Sign Out</span>
          </Button>
        </div>
      </div>
    </div>
  );
}
