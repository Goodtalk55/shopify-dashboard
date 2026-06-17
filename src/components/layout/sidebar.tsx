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

const sidebarItems = [
  { name: "Dashboard", href: "/", icon: LayoutDashboard },
  { name: "Stores", href: "/stores", icon: Store },
  { name: "Bulk Orders", href: "/bulk-orders", icon: ClipboardList },
  { name: "Proxy Settings", href: "/proxies", icon: ShieldCheck },
  { name: "Link Maste Host", href: "/host", icon: Link2 },
  { name: "Activity Logs", href: "/logs", icon: History },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <div className="flex flex-col h-full bg-card border-r border-border text-card-foreground">
      <div className="p-6">
        <h1 className="text-xl font-bold tracking-tight flex items-center gap-2">
          <div className="w-8 h-8 bg-primary rounded-md flex items-center justify-center text-primary-foreground">
            GV
          </div>
          <span className="hidden lg:inline">GV Automations</span>
        </h1>
      </div>
      <ScrollArea className="flex-1 px-4">
        <nav className="space-y-2">
          {sidebarItems.map((item) => (
            <Link
              key={item.name}
              href={item.href}
              className={cn(
                "flex items-center gap-3 px-3 py-2 rounded-md transition-colors",
                pathname === item.href 
                  ? "bg-secondary text-secondary-foreground" 
                  : "hover:bg-accent hover:text-accent-foreground"
              )}
            >
              <item.icon className="w-5 h-5" />
              <span className="hidden lg:inline">{item.name}</span>
            </Link>
          ))}
        </nav>
      </ScrollArea>
      <div className="p-4 mt-auto">
        <Separator className="mb-4" />
        <div className="flex flex-col gap-2">
          <Button variant="ghost" className="justify-start gap-3 w-full">
            <UserCircle className="w-5 h-5" />
            <span className="hidden lg:inline">Profile</span>
          </Button>
          <Button variant="ghost" className="justify-start gap-3 w-full text-destructive hover:text-destructive hover:bg-destructive/10">
            <LogOut className="w-5 h-5" />
            <span className="hidden lg:inline">Sign-out</span>
          </Button>
        </div>
      </div>
    </div>
  );
}
