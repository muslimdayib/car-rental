"use client";

import { useState, useMemo } from "react";
import { useBookings, Booking } from "@/lib/hooks/useBookings";
import { createClient } from "@/lib/supabase/client";
import BookingFormModal from "@/components/bookings/BookingFormModal";
import BookingDetailDrawer from "@/components/bookings/BookingDetailDrawer";
import AssignDriverModal from "@/components/bookings/AssignDriverModal";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  Plus, Eye, Edit2, Trash2, Search, Loader2, AlertCircle,
  CalendarDays, AlertTriangle, UserPlus,
} from "lucide-react";

const TABS = ["All", "Reserved", "Active", "Completed", "Cancelled"];

function statusBadge(s: string) {
  const m: Record<string, string> = {
    Active: "bg-emerald-500 text-white",
    Reserved: "bg-indigo-500 text-white",
    Completed: "bg-gray-500 text-white",
    Cancelled: "bg-red-500 text-white",
  };
  return <Badge className={m[s] || ""}>{s}</Badge>;
}
function paymentBadge(s: string) {
  const m: Record<string, string> = {
    Paid: "text-emerald-600 border-emerald-500 bg-emerald-50",
    Pending: "text-amber-600 border-amber-500 bg-amber-50",
    Partial: "text-blue-600 border-blue-500 bg-blue-50",
    Refunded: "text-gray-500 border-gray-400",
  };
  return <Badge variant="outline" className={m[s] || ""}>{s}</Badge>;
}
const fmt = (d?: string) => d ? new Date(d).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" }) : "—";

export default function BookingsPage() {
  const [activeTab, setActiveTab] = useState("All");
  const { data: bookings, loading, error: fetchError, refetch } = useBookings(activeTab);
  const supabase = createClient();

  const [searchQuery, setSearchQuery] = useState("");
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingBooking, setEditingBooking] = useState<Booking | null>(null);
  const [viewingBooking, setViewingBooking] = useState<Booking | null>(null);
  const [deletingBooking, setDeletingBooking] = useState<Booking | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);
  // Fix 4 — Assign Driver modal
  const [assignDriverBookingId, setAssignDriverBookingId] = useState<string | null>(null);

  const lateCount = useMemo(() => bookings.filter((b) => b.isLate).length, [bookings]);

  const filtered = useMemo(() => {
    const q = searchQuery.toLowerCase();
    if (!q) return bookings;
    return bookings.filter(
      (b) =>
        b.customers?.full_name?.toLowerCase().includes(q) ||
        b.cars?.plate_number?.toLowerCase().includes(q) ||
        b.cars?.brand?.toLowerCase().includes(q) ||
        b.contract_number?.toLowerCase().includes(q)
    );
  }, [bookings, searchQuery]);

  const handleDelete = async () => {
    if (!deletingBooking) return;
    setIsDeleting(true);
    setDeleteError(null);
    try {
      const { error } = await supabase.from("bookings").delete().eq("id", deletingBooking.id);
      if (error) throw error;
      // Free the car if it was rented by this booking
      if (deletingBooking.status === "Active") {
        await supabase.from("cars").update({ status: "Available" }).eq("id", deletingBooking.car_id);
      }
      setDeletingBooking(null);
      refetch();
    } catch (err: any) {
      setDeleteError(err.message || "Failed to delete");
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="flex-1 space-y-6 pb-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Bookings</h2>
          <p className="text-muted-foreground mt-1 flex items-center gap-2">
            Manage reservations, rentals, and returns.
            {lateCount > 0 && (
              <Badge variant="destructive" className="animate-pulse gap-1">
                <AlertTriangle className="h-3 w-3" />{lateCount} overdue
              </Badge>
            )}
          </p>
        </div>
        <Button className="gap-2 shrink-0" onClick={() => { setEditingBooking(null); setIsFormOpen(true); }}>
          <Plus className="h-4 w-4" /> Create Booking
        </Button>
      </div>

      {/* Tabs + Search */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center p-1 bg-muted rounded-lg w-full sm:w-auto overflow-x-auto gap-0.5">
          {TABS.map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-3 py-1.5 text-sm font-medium rounded-md transition-all whitespace-nowrap ${
                activeTab === tab ? "bg-background text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"
              }`}
            >
              {tab}
            </button>
          ))}
        </div>
        <div className="relative w-full sm:w-[280px]">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search customer, plate…"
            className="pl-8 bg-background"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>

      {fetchError && (
        <div className="bg-destructive/10 text-destructive p-3 rounded-lg flex items-center gap-2 text-sm">
          <AlertCircle className="h-4 w-4 shrink-0" />{fetchError}
        </div>
      )}

      {/* Table */}
      <Card>
        <CardContent className="p-0 overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[100px]">Booking ID</TableHead>
                <TableHead>Customer</TableHead>
                <TableHead>Vehicle</TableHead>
                <TableHead>Driver</TableHead>
                <TableHead>Pickup</TableHead>
                <TableHead>Return</TableHead>
                <TableHead>Days</TableHead>
                <TableHead>Total</TableHead>
                <TableHead>Payment</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <TableRow key={i} className="animate-pulse">
                    {Array.from({ length: 11 }).map((_, j) => (
                      <TableCell key={j}><div className="h-4 bg-muted rounded w-full" /></TableCell>
                    ))}
                  </TableRow>
                ))
              ) : filtered.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={11} className="h-32 text-center">
                    <div className="flex flex-col items-center gap-2 text-muted-foreground">
                      <CalendarDays className="h-10 w-10 opacity-20" />
                      {bookings.length === 0 ? "No bookings yet. Create your first booking." : "No bookings match your search."}
                    </div>
                  </TableCell>
                </TableRow>
              ) : (
                filtered.map((booking, idx) => (
                  <TableRow
                    key={booking.id}
                    className={`group hover:bg-muted/40 transition-colors ${booking.isLate ? "bg-red-50 dark:bg-red-950/20" : ""}`}
                  >
                    <TableCell className="font-mono text-xs text-muted-foreground">
                      <div className="flex items-center gap-1">
                        {booking.isLate && <AlertTriangle className="h-3 w-3 text-red-500 shrink-0" />}
                        {booking.contract_number || `BK-${String(idx + 1).padStart(3, "0")}`}
                      </div>
                    </TableCell>
                    <TableCell className="font-medium">{booking.customers?.full_name || "—"}</TableCell>
                    <TableCell>
                      <div>
                        <p className="font-medium">{booking.cars ? `${booking.cars.brand} ${booking.cars.model}` : "—"}</p>
                        <p className="font-mono text-xs text-muted-foreground">{booking.cars?.plate_number}</p>
                      </div>
                    </TableCell>
                    <TableCell className="text-sm">{booking.drivers?.full_name || <span className="text-muted-foreground">—</span>}</TableCell>
                    <TableCell className="text-sm">{fmt(booking.start_date)}</TableCell>
                    <TableCell className="text-sm">{fmt(booking.end_date)}</TableCell>
                    <TableCell className="text-center">{booking.days}</TableCell>
                    <TableCell className="font-medium">${Number(booking.total_amount).toLocaleString()}</TableCell>
                    <TableCell>{paymentBadge(booking.payment_status)}</TableCell>
                    <TableCell>{statusBadge(booking.status)}</TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <Button
                          variant="ghost" size="icon" className="h-8 w-8"
                          title="View" onClick={() => setViewingBooking(booking)}
                        ><Eye className="h-4 w-4" /></Button>
                        <Button
                          variant="ghost" size="icon" className="h-8 w-8"
                          title="Edit" onClick={() => { setEditingBooking(booking); setIsFormOpen(true); }}
                        ><Edit2 className="h-4 w-4" /></Button>
                        {/* Fix 4 — Assign Driver button */}
                        <Button
                          variant="ghost" size="icon" className="h-8 w-8 text-blue-500 hover:text-blue-600 hover:bg-blue-50"
                          title="Assign Driver" onClick={() => setAssignDriverBookingId(booking.id)}
                        ><UserPlus className="h-4 w-4" /></Button>
                        <Button
                          variant="ghost" size="icon" className="h-8 w-8 text-destructive hover:text-destructive hover:bg-destructive/10"
                          title="Delete" onClick={() => { setDeleteError(null); setDeletingBooking(booking); }}
                        ><Trash2 className="h-4 w-4" /></Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Modals */}
      {isFormOpen && (
        <BookingFormModal
          open={isFormOpen}
          onClose={() => setIsFormOpen(false)}
          onSaved={() => { setIsFormOpen(false); refetch(); }}
          initialData={editingBooking}
        />
      )}

      <BookingDetailDrawer
        booking={viewingBooking}
        onClose={() => setViewingBooking(null)}
        onRefetch={refetch}
      />

      {/* Fix 4 — Assign Driver Modal */}
      <AssignDriverModal
        bookingId={assignDriverBookingId}
        onClose={() => setAssignDriverBookingId(null)}
        onSaved={() => { setAssignDriverBookingId(null); refetch(); }}
      />

      <AlertDialog open={!!deletingBooking} onOpenChange={(o) => !o && setDeletingBooking(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Booking</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this booking for{" "}
              <strong>{deletingBooking?.customers?.full_name}</strong>? This cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          {deleteError && (
            <div className="bg-destructive/10 text-destructive text-sm p-3 rounded flex items-center gap-2">
              <AlertCircle className="h-4 w-4 shrink-0" />{deleteError}
            </div>
          )}
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              disabled={isDeleting}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {isDeleting && <Loader2 className="h-4 w-4 animate-spin mr-2" />}
              Delete Booking
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
