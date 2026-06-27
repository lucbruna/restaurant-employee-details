"use client";

import Link from "next/link";
import { useSession, signOut } from "next-auth/react";
import { Bell, Search, User, LogOut, Settings } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Breadcrumb } from "./breadcrumb";
import { usePathname } from "next/navigation";
import { BrandMark } from "@/components/brand/brand-mark";
import { ThemeToggle } from "@/components/theme/theme-toggle";

export function Header() {
  const { data: sessionData } = useSession();
  const pathname = usePathname();
  const user = sessionData?.user;

  // Hide header on POS and Kitchen screens for full-screen experience
  if (pathname === "/pos" || pathname === "/kitchen") {
    return null;
  }

  return (
    <header className="surface-shell sticky top-4 z-20 mx-4 mb-4 flex h-[76px] shrink-0 items-center justify-between rounded-[var(--radius-xl)] border border-border/80 px-4 md:px-6">
      <div className="flex items-center gap-4">
        <Link href="/dashboard" className="xl:hidden">
          <BrandMark compact />
        </Link>
        <div className="hidden xl:flex xl:flex-col">
          <span className="text-[10px] font-black uppercase tracking-[0.24em] text-muted-foreground">
            Restaurant OS
          </span>
          <div className="mt-1">
            <Breadcrumb />
          </div>
        </div>
        <div className="xl:hidden">
          <Breadcrumb />
        </div>
      </div>

      <div className="flex items-center gap-4">
        <div className="relative hidden md:block w-72">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Buscar mesas, clientes ou pedidos"
            className="h-10 border-border/80 bg-card/95 pl-9 shadow-[var(--shadow-elevation-1)] focus-visible:bg-card"
          />
        </div>

        <ThemeToggle />

        <Button variant="ghost" size="icon" className="relative h-10 w-10 rounded-full text-muted-foreground hover:text-foreground">
          <Bell className="w-5 h-5" />
          <span className="absolute top-2 right-2 h-2.5 w-2.5 rounded-full border-2 border-card bg-primary" />
        </Button>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="relative h-10 w-10 rounded-full">
              <Avatar className="h-9 w-9">
                <AvatarImage src={user?.image || ""} alt={user?.name || ""} />
                <AvatarFallback className="bg-primary/10 text-primary font-semibold">
                  {user?.name?.charAt(0) || "U"}
                </AvatarFallback>
              </Avatar>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="w-56 border-border/70 bg-popover/95 backdrop-blur" align="end" forceMount>
            <DropdownMenuLabel className="font-normal">
              <div className="flex flex-col space-y-1">
                <p className="text-sm font-medium leading-none">{user?.name || 'User'}</p>
                <p className="text-xs leading-none text-muted-foreground">
                  {user?.email || 'No email'}
                </p>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem>
              <User className="mr-2 h-4 w-4" />
              <span>Perfil</span>
            </DropdownMenuItem>
            <DropdownMenuItem>
              <Settings className="mr-2 h-4 w-4" />
              <span>Configurações</span>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={() => signOut({ callbackUrl: "/login" })} className="text-destructive focus:text-destructive">
              <LogOut className="mr-2 h-4 w-4" />
              <span>Sair</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}
