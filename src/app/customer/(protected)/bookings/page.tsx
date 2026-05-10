"use client";

import { useCustomerBookings } from "@/lib/hooks/useCustomerBookings";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { createClient } from "@/lib/supabase/client";
import { Loader2 } from "lucide-react";
import { useState } from "react";

export default function MyBookingsPage() {
  const { data: bookings, loading, refetch } = useCustomerBookings();
  const [cancellingId, setCancellingId] = useState<string | null>(null);
  
  const supabase = createClient();

  const handleCancel = async (id: string, carId: string) => {
    if (!confirm("Are you sure you want to cancel this booking?")) return;
    
    setCancellingId(id);
    try {
      // 1. Update Booking to Cancelled
      await supabase
        .from('bookings')
        .update({ status: 'Cancelled' })
        .eq('id', id);

      // 2. Update Car status to Available
      await supabase
        .from('cars')
        .update({ status: 'Available' })
        .eq('id', carId);
        
      refetch();
    } catch (err) {
      alert("Failed to cancel booking.");
    } finally {
      setCancellingId(null);
    }
  };

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
      <h1 className="text-3xl font-bold tracking-tight">My Bookings</h1>
      
      <Card>
        <CardHeader>
          <CardTitle>Booking History</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
             <div className="flex justify-center p-12"><Loader2 className="h-8 w-8 animate-spin text-muted-foreground" /></div>
          ) : bookings.length === 0 ? (
            <div className="text-center p-8 text-muted-foreground">You have no bookings yet.</div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Booking Ref</TableHead>
                  <TableHead>Vehicle</TableHead>
                  <TableHead>Dates</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {bookings.map((booking) => (
                  <TableRow key={booking.id}>
                    <TableCell className="font-medium text-muted-foreground">{booking.id.split('-')[0]}</TableCell>
                    <TableCell className="font-medium">{booking.cars?.name}</TableCell>
                    <TableCell>{new Date(booking.start_date).toLocaleDateString()} - {new Date(booking.end_date).toLocaleDateString()}</TableCell>
                    <TableCell className="font-medium">${booking.total_amount}</TableCell>
                    <TableCell>{getStatusBadge(booking.status)}</TableCell>
                    <TableCell className="text-right">
                      {booking.status === 'Reserved' && (
                        <Button 
                          variant="destructive" 
                          size="sm" 
                          onClick={() => handleCancel(booking.id, booking.car_id)}
                          disabled={cancellingId === booking.id}
                        >
                          {cancellingId === booking.id ? <Loader2 className="h-4 w-4 animate-spin" /> : "Cancel"}
                        </Button>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
