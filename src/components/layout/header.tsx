"use client";

import { usePathname } from "next/navigation";
import { RefreshCw, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export function Header() {
  const pathname = usePathname();
  
  // Format the page name from the pathname
  const pageName = pathname === "/" 
    ? "Dashboard" 
    : pathname.split("/").filter(Boolean).map(s => s.charAt(0).toUpperCase() + s.slice(1).replace("-", " ")).join(" > ");

  return (
    <header className="h-16 border-b border-border bg-card flex items-center justify-between px-6 sticky top-0 z-10">
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground bg-accent px-3 py-1 rounded-full">
          <span>gv-shopify-automations.vercel.app</span>
          <span>/</span>
          <span className="text-foreground">{pathname === "/" ? "dashboard" : pathname.slice(1)}</span>
        </div>
        <h2 className="text-lg font-semibold ml-4">{pageName}</h2>
      </div>
      
      <div className="flex items-center gap-4">
        <div className="relative hidden md:block">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Search..."
            className="pl-8 w-[250px] bg-accent border-none focus-visible:ring-1"
          />
        </div>
        <Button variant="outline" size="icon" onClick={() => window.location.reload()}>
          <RefreshCw className="h-4 w-4" />
        </Button>
      </div>
    </header>
  );
}
