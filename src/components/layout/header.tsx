"use client";

import { usePathname } from "next/navigation";
import { RefreshCw, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export function Header() {
  const pathname = usePathname();
  
  const pageName = pathname === "/" 
    ? "Dashboard" 
    : pathname.split("/").filter(Boolean).map(s => s.charAt(0).toUpperCase() + s.slice(1).replace("-", " ")).join(" > ");

  return (
    <header className="h-20 border-b border-zinc-800/50 bg-zinc-950/50 backdrop-blur-md flex items-center justify-between px-8 sticky top-0 z-10">
      <div className="flex flex-col">
        <h2 className="text-xl font-bold text-white">{pageName}</h2>
        <p className="text-xs text-zinc-500 font-medium tracking-wide">
          {pathname === "/" ? "Welcome back, Admin" : `Manage your ${pageName.toLowerCase()}`}
        </p>
      </div>
      
      <div className="flex items-center gap-4">
        <div className="relative hidden md:block">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-zinc-500" />
          <Input
            type="search"
            placeholder="Search resources..."
            className="pl-10 w-[300px] bg-zinc-900 border-zinc-800 text-white placeholder:text-zinc-600 focus-visible:ring-blue-500 rounded-xl"
          />
        </div>
        <div className="h-8 w-[1px] bg-zinc-800 mx-2" />
        <Button 
          variant="ghost" 
          size="icon" 
          className="rounded-xl hover:bg-zinc-900 text-zinc-400 hover:text-white"
          onClick={() => window.location.reload()}
        >
          <RefreshCw className="h-4 w-4" />
        </Button>
      </div>
    </header>
  );
}
