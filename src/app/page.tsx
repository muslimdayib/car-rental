"use client";

import Link from "next/link";
import { Car } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function LandingPage() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-background relative overflow-hidden">
      <div className="absolute top-0 w-full h-full bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-primary/20 via-background to-background pointer-events-none" />
      
      <div className="relative z-10 w-full max-w-lg p-8 flex flex-col items-center text-center">
        <div className="h-24 w-24 rounded-[2rem] bg-gradient-to-br from-primary to-blue-600 flex items-center justify-center shadow-2xl mb-8">
          <Car className="h-12 w-12 text-white" />
        </div>
        
        <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight mb-4">FleetOS</h1>
        <p className="text-lg text-muted-foreground mb-12 max-w-md">
          The ultimate platform for modern car rental and fleet management.
        </p>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 w-full">
          <Link href="/customer/login" className="w-full">
            <Button size="lg" className="w-full h-16 text-lg rounded-2xl shadow-lg hover:shadow-xl transition-all font-medium">
              Customer Portal
            </Button>
          </Link>
          
          <Link href="/login" className="w-full">
            <Button size="lg" variant="outline" className="w-full h-16 text-lg rounded-2xl bg-card/50 backdrop-blur-sm border-border/50 hover:bg-card hover:border-primary/50 transition-all font-medium">
              Staff Login
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
