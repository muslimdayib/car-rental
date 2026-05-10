"use client";

import { createClient } from "@/lib/supabase/client";
import { Booking } from "@/lib/hooks/useBookings";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { AlertCircle, Car, CheckCircle2, Clock, Loader2, MapPin, Printer, User, XCircle, AlertTriangle } from "lucide-react";
import { useState } from "react";

interface Props {
  booking: Booking | null;
  onClose: () => void;
  onRefetch: () => void;
}

function Row({ label, value }: { label: string; value?: string | null | React.ReactNode }) {
  if (!value && value !== 0) return null;
  return (
    <div className="flex justify-between text-sm py-1">
      <span className="text-muted-foreground">{label}</span>
      <span className="font-medium text-right max-w-[60%]">{value}</span>
    </div>
  );
}

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
    Refunded: "text-gray-500 border-gray-400 bg-gray-50",
  };
  return <Badge variant="outline" className={m[s] || ""}>{s}</Badge>;
}

export default function BookingDetailDrawer({ booking, onClose, onRefetch }: Props) {
  const supabase = createClient();
  const [acting, setActing] = useState(false);
  const [actError, setActError] = useState<string | null>(null);

  if (!booking) return null;

  const days = booking.days || 1;
  const pricePerDay = booking.cars?.price_per_day || 0;
  const subtotal = days * pricePerDay;
  const deposit = Number(booking.security_deposit) || 0;
  const discount = Number(booking.discount_amount) || 0;
  const total = Number(booking.total_amount) || 0;
  const paid = Number(booking.amount_paid) || 0;
  const balance = total - paid;

  const fmt = (d?: string) => d ? new Date(d).toLocaleDateString("en-GB", { day:"2-digit", month:"short", year:"numeric" }) : "—";
  const fmtTime = (t?: string) => t ? t.slice(0, 5) : "";

  async function changeStatus(newStatus: string) {
    setActing(true);
    setActError(null);
    try {
      const { error: be } = await supabase.from("bookings").update({ status: newStatus }).eq("id", booking!.id);
      if (be) throw be;
      const carId = booking!.car_id;
      if (newStatus === "Active") await supabase.from("cars").update({ status: "Rented" }).eq("id", carId);
      if (newStatus === "Completed" || newStatus === "Cancelled") await supabase.from("cars").update({ status: "Available" }).eq("id", carId);
      onRefetch();
      onClose();
    } catch (err: any) {
      setActError(err.message || "Failed to update status");
    } finally {
      setActing(false);
    }
  }

  return (
    <Sheet open={!!booking} onOpenChange={(o) => !o && onClose()}>
      <SheetContent className="w-full sm:max-w-[520px] overflow-y-auto p-0" side="right">
        {/* Header */}
        <div className="sticky top-0 z-10 bg-background border-b px-6 py-4">
          <SheetHeader>
            <SheetTitle className="flex items-center gap-3">
              <span className="font-mono text-base">{booking.contract_number || booking.id.split("-")[0].toUpperCase()}</span>
              {statusBadge(booking.status)}
              {booking.isLate && (
                <Badge variant="destructive" className="animate-pulse">
                  LATE — {booking.daysLate}d overdue
                </Badge>
              )}
            </SheetTitle>
            <p className="text-xs text-muted-foreground mt-0.5">Created {fmt(booking.created_at)}</p>
          </SheetHeader>
        </div>

        <div className="px-6 py-4 space-y-5">
          {actError && (
            <div className="bg-destructive/10 text-destructive text-sm p-3 rounded flex items-center gap-2">
              <AlertCircle className="h-4 w-4 shrink-0" />{actError}
            </div>
          )}

          {/* Action buttons */}
          <div className="flex flex-wrap gap-2">
            {booking.status === "Reserved" && (
              <Button size="sm" className="bg-emerald-600 hover:bg-emerald-700 text-white gap-1" onClick={() => changeStatus("Active")} disabled={acting}>
                {acting ? <Loader2 className="h-3 w-3 animate-spin" /> : <CheckCircle2 className="h-3 w-3" />}
                Mark Active
              </Button>
            )}
            {booking.status === "Active" && (
              <Button size="sm" className="bg-blue-600 hover:bg-blue-700 text-white gap-1" onClick={() => changeStatus("Completed")} disabled={acting}>
                {acting ? <Loader2 className="h-3 w-3 animate-spin" /> : <CheckCircle2 className="h-3 w-3" />}
                Mark Completed
              </Button>
            )}
            {(booking.status === "Reserved" || booking.status === "Active") && (
              <Button size="sm" variant="destructive" className="gap-1" onClick={() => changeStatus("Cancelled")} disabled={acting}>
                <XCircle className="h-3 w-3" />Cancel
              </Button>
            )}
            <Button size="sm" variant="outline" className="gap-1 ml-auto" onClick={() => window.print()}>
              <Printer className="h-3 w-3" />Receipt
            </Button>
          </div>

          <Separator />

          {/* Customer */}
          <div>
            <div className="flex items-center gap-2 mb-2">
              <User className="h-4 w-4 text-primary" />
              <span className="font-semibold text-sm">Customer</span>
              {booking.customers?.tag && <Badge variant="outline" className="text-xs">{booking.customers.tag}</Badge>}
            </div>
            <Row label="Name" value={booking.customers?.full_name} />
            <Row label="Phone" value={booking.customers?.phone} />
            <Row label="Email" value={booking.customers?.email} />
          </div>

          <Separator />

          {/* Car */}
          <div>
            <div className="flex items-center gap-2 mb-2">
              <Car className="h-4 w-4 text-primary" />
              <span className="font-semibold text-sm">Vehicle</span>
            </div>
            {booking.cars?.image_url && (
              <img src={booking.cars.image_url} alt="car" className="w-full h-32 object-cover rounded-md mb-3" />
            )}
            <Row label="Vehicle" value={booking.cars ? `${booking.cars.brand} ${booking.cars.model}` : "—"} />
            <Row label="Plate" value={<span className="font-mono">{booking.cars?.plate_number}</span>} />
            <Row label="Category" value={booking.cars?.category} />
          </div>

          <Separator />

          {/* Trip */}
          <div>
            <div className="flex items-center gap-2 mb-2">
              <MapPin className="h-4 w-4 text-primary" />
              <span className="font-semibold text-sm">Trip Details</span>
            </div>
            <Row label="Pickup" value={`${fmt(booking.start_date)}${fmtTime(booking.pickup_time) ? " at " + fmtTime(booking.pickup_time) : ""}`} />
            <Row label="Return" value={`${fmt(booking.end_date)}${fmtTime(booking.return_time) ? " at " + fmtTime(booking.return_time) : ""}`} />
            <Row label="Pickup Location" value={booking.pickup_location} />
            <Row label="Return Location" value={booking.return_location} />
            <Row label="Duration" value={`${days} day${days !== 1 ? "s" : ""}`} />
            <Row label="Source" value={booking.booking_source} />
            {booking.isLate && (
              <div className="flex items-center gap-2 mt-2 text-red-500 text-sm font-medium">
                <AlertTriangle className="h-4 w-4" />
                {booking.daysLate} day{booking.daysLate !== 1 ? "s" : ""} overdue
              </div>
            )}
          </div>

          <Separator />

          {/* Financial */}
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="font-semibold text-sm">Financial Summary</span>
              {paymentBadge(booking.payment_status)}
            </div>
            <Row label="Price/day" value={`$${pricePerDay}`} />
            <Row label="Days" value={String(days)} />
            <Row label="Subtotal" value={`$${subtotal.toLocaleString()}`} />
            <Row label="Security Deposit" value={`$${deposit}`} />
            {discount > 0 && <Row label="Discount" value={`-$${discount}`} />}
            <div className="flex justify-between text-sm font-bold pt-2 border-t mt-1">
              <span>Total</span><span>${total.toLocaleString()}</span>
            </div>
            <Row label="Amount Paid" value={`$${paid.toLocaleString()}`} />
            {balance > 0 && (
              <div className="flex justify-between text-sm font-semibold text-amber-600">
                <span>Balance Due</span><span>${balance.toLocaleString()}</span>
              </div>
            )}
            <Row label="Payment Method" value={booking.payment_method} />
          </div>

          {/* Driver */}
          {booking.drivers && (
            <>
              <Separator />
              <div>
                <p className="font-semibold text-sm mb-2">Assigned Driver</p>
                <Row label="Name" value={booking.drivers.full_name} />
                <Row label="License" value={booking.drivers.license_number} />
              </div>
            </>
          )}

          {/* Notes */}
          {booking.notes && (
            <>
              <Separator />
              <div>
                <p className="font-semibold text-sm mb-1">Notes</p>
                <p className="text-sm text-muted-foreground">{booking.notes}</p>
              </div>
            </>
          )}

          {/* Timeline */}
          <Separator />
          <div>
            <p className="font-semibold text-sm mb-3">Status Timeline</p>
            <div className="space-y-2">
              {["Reserved", "Active", "Completed"].map((s, i) => {
                const statusOrder = ["Reserved","Active","Completed"];
                const currentIdx = statusOrder.indexOf(booking.status);
                const isDone = i <= currentIdx && booking.status !== "Cancelled";
                return (
                  <div key={s} className="flex items-center gap-3">
                    <div className={`h-7 w-7 rounded-full flex items-center justify-center border-2 shrink-0 ${isDone ? "bg-emerald-500 border-emerald-500 text-white" : "border-muted text-muted-foreground"}`}>
                      {isDone ? <CheckCircle2 className="h-4 w-4" /> : <Clock className="h-3 w-3" />}
                    </div>
                    <span className={`text-sm ${isDone ? "font-medium" : "text-muted-foreground"}`}>{s}</span>
                  </div>
                );
              })}
              {booking.status === "Cancelled" && (
                <div className="flex items-center gap-3">
                  <div className="h-7 w-7 rounded-full flex items-center justify-center border-2 border-red-500 text-red-500 shrink-0">
                    <XCircle className="h-4 w-4" />
                  </div>
                  <span className="text-sm font-medium text-red-500">Cancelled</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}
