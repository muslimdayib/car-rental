"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Car, LogOut, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { createClient } from "@/lib/supabase/client";

export default function CustomerProtectedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const supabase = createClient();

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push("/customer/login");
  };

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-8">
            <Link href="/customer/dashboard" className="flex items-center gap-2">
              <Car className="h-6 w-6 text-primary" />
              <span className="text-xl font-bold tracking-tight">RentFlow Customer</span>
            </Link>
            
            <nav className="hidden md:flex items-center gap-6 text-sm font-medium">
              <Link href="/customer/dashboard" className={`transition-colors hover:text-foreground/80 ${pathname === '/customer/dashboard' ? 'text-foreground' : 'text-foreground/60'}`}>Dashboard</Link>
              <Link href="/customer/book" className={`transition-colors hover:text-foreground/80 ${pathname === '/customer/book' ? 'text-foreground' : 'text-foreground/60'}`}>Book a Car</Link>
              <Link href="/customer/bookings" className={`transition-colors hover:text-foreground/80 ${pathname === '/customer/bookings' ? 'text-foreground' : 'text-foreground/60'}`}>My Bookings</Link>
            </nav>
          </div>

          <div className="flex items-center gap-4">
            <Link href="/customer/profile">
              <Button variant="ghost" size="icon" className="rounded-full">
                <User className="h-5 w-5 text-muted-foreground hover:text-foreground" />
              </Button>
            </Link>
            <Button variant="outline" size="sm" onClick={handleLogout} className="gap-2 hidden sm:flex">
              <LogOut className="h-4 w-4" />
              Sign Out
            </Button>
          </div>
        </div>
      </header>

      <main className="flex-1 container mx-auto px-4 py-8">
        {children}
      </main>
    </div>
  );
}
