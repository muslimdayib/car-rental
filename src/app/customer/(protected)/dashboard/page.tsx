"use client";

import { useCustomerBookings } from "@/lib/hooks/useCustomerBookings";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { CalendarDays, Car, DollarSign, Clock, Loader2 } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function CustomerDashboard() {
  const { data: bookings, loading } = useCustomerBookings();

  const activeBookings = bookings.filter(b => b.status === 'Active' || b.status === 'Reserved').length;
  const completedBookings = bookings.filter(b => b.status === 'Completed').length;
  const totalSpent = bookings.filter(b => b.status === 'Completed' || b.status === 'Active')
                             .reduce((sum, b) => sum + (Number(b.total_amount) || 0), 0);

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "Active": return <Badge className="bg-emerald-500 text-white">Active</Badge>;
      case "Reserved": return <Badge variant="secondary">Reserved</Badge>;
      case "Completed": return <Badge variant="outline">Completed</Badge>;
      case "Cancelled": return <Badge variant="destructive">Cancelled</Badge>;
      default: return <Badge>{status}</Badge>;
    }
  };

  return (
    <div className="space-y-6 pb-8">
      <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
      
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Active & Upcoming</CardTitle>
            <CalendarDays className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {loading ? (
               <div className="h-8 w-16 bg-muted animate-pulse rounded mt-1"></div>
            ) : (
              <div className="text-2xl font-bold">{activeBookings}</div>
            )}
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Completed Trips</CardTitle>
            <Car className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {loading ? (
               <div className="h-8 w-16 bg-muted animate-pulse rounded mt-1"></div>
            ) : (
              <div className="text-2xl font-bold">{completedBookings}</div>
            )}
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Total Spent</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {loading ? (
               <div className="h-8 w-24 bg-muted animate-pulse rounded mt-1"></div>
            ) : (
              <div className="text-2xl font-bold">${totalSpent.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</div>
            )}
          </CardContent>
        </Card>
      </div>

      <div className="mt-8">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold">Recent Activity</h2>
          <Link href="/customer/bookings">
            <Button variant="outline" size="sm">View All</Button>
          </Link>
        </div>
        <Card>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Booking Ref</TableHead>
                  <TableHead>Vehicle</TableHead>
                  <TableHead>Dates</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  Array.from({ length: 3 }).map((_, i) => (
                    <TableRow key={i} className="animate-pulse">
                      <TableCell><div className="h-4 w-20 bg-muted rounded"></div></TableCell>
                      <TableCell><div className="h-4 w-32 bg-muted rounded"></div></TableCell>
                      <TableCell><div className="h-4 w-24 bg-muted rounded"></div></TableCell>
                      <TableCell><div className="h-4 w-16 bg-muted rounded"></div></TableCell>
                      <TableCell><div className="h-6 w-16 bg-muted rounded-full"></div></TableCell>
                    </TableRow>
                  ))
                ) : bookings.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} className="h-24 text-center text-muted-foreground">
                      No recent activity found. Head over to Book a Car to start your next trip!
                    </TableCell>
                  </TableRow>
                ) : (
                  bookings.slice(0, 5).map(booking => (
                    <TableRow key={booking.id}>
                      <TableCell className="font-medium text-muted-foreground">{booking.id.split('-')[0]}</TableCell>
                      <TableCell className="font-medium">{booking.cars?.name}</TableCell>
                      <TableCell className="text-muted-foreground text-sm">
                        {new Date(booking.start_date).toLocaleDateString()} - {new Date(booking.end_date).toLocaleDateString()}
                      </TableCell>
                      <TableCell className="font-medium">${booking.total_amount}</TableCell>
                      <TableCell>{getStatusBadge(booking.status)}</TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
