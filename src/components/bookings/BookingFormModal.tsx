"use client";

import { useState, useEffect, useMemo } from "react";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

// Shared class for native selects — matches shadcn Input appearance
const NATIVE_SELECT_CLS = "flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { AlertCircle, Loader2, CalendarDays, Car, User, DollarSign } from "lucide-react";

interface BookingFormProps {
  open: boolean;
  onClose: () => void;
  onSaved: () => void;
  initialData?: any;
}

const EMPTY = {
  customer_id: "", car_id: "", driver_id: "",
  start_date: "", end_date: "", pickup_time: "", return_time: "",
  pickup_location: "", return_location: "",
  discount_amount: 0, amount_paid: 0,
  payment_method: "Cash", payment_status: "Pending",
  booking_source: "Walk-in", status: "Reserved",
  notes: "", terms_accepted: false,
  customer_is_driver: true, // FIX 2 — default: customer IS the driver
};

function calcDays(s: string, e: string) {
  if (!s || !e) return 0;
  return Math.max(1, Math.ceil((new Date(e).getTime() - new Date(s).getTime()) / 86400000));
}

export default function BookingFormModal({ open, onClose, onSaved, initialData }: BookingFormProps) {
  const supabase = createClient();
  const [form, setForm] = useState<any>(initialData || EMPTY);
  const [customers, setCustomers] = useState<any[]>([]);
  const [cars, setCars] = useState<any[]>([]);
  const [drivers, setDrivers] = useState<any[]>([]);
  const [selectedCar, setSelectedCar] = useState<any>(null);
  const [selectedDriver, setSelectedDriver] = useState<any>(null);
  const [driverWarning, setDriverWarning] = useState<string | null>(null);
  const [driverBlocked, setDriverBlocked] = useState(false);
  const [customerIsDriver, setCustomerIsDriver] = useState<boolean>(
    initialData ? (initialData.driver_id == null) : true
  );
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // FIX 1 — Inline Customer Driver Registration
  const [inlineDriverForm, setInlineDriverForm] = useState<any>(null);
  const [inlineDriverMsg, setInlineDriverMsg] = useState<{type: "success" | "error" | "info" | "warning", text: string} | null>(null);
  const [inlineSaving, setInlineSaving] = useState(false);

  const set = (k: string, v: any) => setForm((p: any) => ({ ...p, [k]: v }));

  useEffect(() => {
    async function load() {
      const [c, ca, d] = await Promise.all([
        supabase.from("customers").select("id,full_name,phone").order("full_name"),
        supabase.from("cars").select("id,name,brand,model,plate_number,price_per_day,security_deposit,status,fleet_number").in("status", initialData?.car_id ? ["Available","Rented"] : ["Available"]),
        supabase.from("drivers").select("id,full_name,license_number,status,driver_code").eq("status","active"),
      ]);
      setCustomers(c.data || []);
      const allCars = ca.data || [];
      setCars(allCars);
      setDrivers(d.data || []);
      if (initialData?.car_id) {
        const { data: carData } = await supabase.from("cars").select("id,name,brand,model,plate_number,price_per_day,security_deposit,min_rental_age,fleet_number").eq("id", initialData.car_id).single();
        if (carData) setSelectedCar(carData);
      }
    }
    if (open) load();
  }, [open]);

  const days = calcDays(form.start_date, form.end_date);
  const pricePerDay = selectedCar?.price_per_day || 0;
  const subtotal = days * pricePerDay;
  const deposit = selectedCar?.security_deposit || 0;
  const discount = Number(form.discount_amount) || 0;
  const totalAmount = subtotal + deposit - discount;

  // Auto-generate contract number for new bookings
  const contractNum = form.contract_number || `BK-${new Date().getFullYear()}-${Date.now().toString().slice(-4)}`;

  // handleCarChange kept for compatibility (now also called inline in the native select)
  const handleCarChange = (carId: string) => {
    const car = cars.find((c) => c.id === carId);
    setSelectedCar(car || null);
    set("car_id", carId);
  };

  const handleSave = async () => {
    setError(null);
    if (driverBlocked) { setError("Cannot save booking — driver validation failed."); return; }
    if (!form.customer_id) { setError("Please select a customer."); return; }
    if (!form.car_id) { setError("Please select a car."); return; }
    if (!form.start_date || !form.end_date) { setError("Please select pickup and return dates."); return; }
    if (new Date(form.end_date) <= new Date(form.start_date)) { setError("Return date must be after pickup date."); return; }

    setSaving(true);
    try {
      const payload = {
        customer_id: form.customer_id,
        car_id: form.car_id,
        driver_id: customerIsDriver ? null : (form.driver_id || null),
        start_date: form.start_date,
        end_date: form.end_date,
        pickup_time: form.pickup_time || null,
        return_time: form.return_time || null,
        pickup_location: form.pickup_location || null,
        return_location: form.return_location || null,
        total_amount: totalAmount,
        security_deposit: deposit,
        discount_amount: discount,
        amount_paid: Number(form.amount_paid) || 0,
        payment_method: form.payment_method,
        payment_status: form.payment_status,
        booking_source: form.booking_source,
        status: form.status,
        notes: form.notes || null,
        terms_accepted: Boolean(form.terms_accepted),
        contract_number: contractNum,
      };

      if (initialData?.id) {
        const { error: e } = await supabase.from("bookings").update(payload).eq("id", initialData.id);
        if (e) throw e;
      } else {
        const { error: e } = await supabase.from("bookings").insert([payload]);
        if (e) throw e;
        if (form.status === "Active") {
          await supabase.from("cars").update({ status: "Rented" }).eq("id", form.car_id);
        }
      }
      onSaved();
      onClose();
    } catch (err: any) {
      setError(err.message || "Failed to save booking");
    } finally {
      setSaving(false);
    }
  };

  const section = (icon: React.ReactNode, label: string) => (
    <div className="flex items-center gap-2 pt-2 pb-1 border-b mb-3">
      {icon}
      <span className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">{label}</span>
    </div>
  );

  return (
    <Dialog open={open} onOpenChange={() => !saving && onClose()}>
      <DialogContent className="sm:max-w-[680px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{initialData?.id ? "Edit Booking" : "Create New Booking"}</DialogTitle>
        </DialogHeader>

        <div className="space-y-1 py-2">
          {section(<User className="h-4 w-4 text-primary" />, "Customer & Vehicle")}
          <div className="grid grid-cols-1 gap-3">
            <div className="space-y-1.5">
              <Label>Customer *</Label>
              <select
                className={NATIVE_SELECT_CLS}
                value={form.customer_id || ""}
                onChange={(e) => {
                  const id = e.target.value;
                  set("customer_id", id);
                  if (customerIsDriver) {
                    checkCustomerDriver(id, true);
                  }
                }}
              >
                <option value="">Select a customer…</option>
                {customers.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.full_name}{c.phone ? ` — ${c.phone}` : ""}
                  </option>
                ))}
              </select>
            </div>
            <div className="space-y-1.5">
              <Label>Vehicle *</Label>
              <select
                className={NATIVE_SELECT_CLS}
                value={form.car_id || ""}
                onChange={(e) => {
                  const id = e.target.value;
                  const car = cars.find((c) => c.id === id);
                  setSelectedCar(car || null);
                  set("car_id", id);
                }}
              >
                <option value="">Select available car…</option>
                {cars.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.fleet_number ? `${c.fleet_number} — ` : ""}{c.brand} {c.model} — {c.plate_number} (${c.price_per_day}/day)
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-3">
              <div className="flex items-center gap-3 rounded-lg border p-3 bg-muted/20">
                <input
                  type="checkbox"
                  id="customerIsDriver"
                  checked={customerIsDriver}
                  onChange={(e) => {
                    const isDriver = e.target.checked;
                    setCustomerIsDriver(isDriver);
                    if (isDriver) {
                      checkCustomerDriver(form.customer_id, true);
                    } else {
                      set("driver_id", "");
                      setDriverWarning(null);
                      setDriverBlocked(false);
                      setSelectedDriver(null);
                      setInlineDriverForm(null);
                      setInlineDriverMsg(null);
                    }
                  }}
                  className="h-4 w-4 accent-primary"
                />
                <label htmlFor="customerIsDriver" className="text-sm font-medium cursor-pointer">
                  Customer is the driver
                  <span className="block text-xs text-muted-foreground font-normal">Uncheck to assign a different registered driver profile</span>
                </label>
              </div>

              {inlineDriverMsg && (
                <div className={`p-3 rounded-lg text-sm flex items-start gap-2 border ${
                  inlineDriverMsg.type === "success" ? "bg-emerald-50 text-emerald-700 border-emerald-200" :
                  inlineDriverMsg.type === "error" ? "bg-destructive/10 text-destructive border-destructive/20" :
                  inlineDriverMsg.type === "warning" ? "bg-amber-50 text-amber-700 border-amber-200" :
                  "bg-blue-50 text-blue-700 border-blue-200"
                }`}>
                  {inlineDriverMsg.type === "error" || inlineDriverMsg.type === "warning" ? <AlertCircle className="h-4 w-4 mt-0.5 shrink-0" /> : null}
                  <div>{inlineDriverMsg.text}</div>
                </div>
              )}

              {customerIsDriver && inlineDriverForm && (
                <div className="border rounded-lg p-4 bg-background shadow-sm space-y-4">
                  <h4 className="font-semibold text-sm">Complete Driver Registration</h4>
                  <div className="grid grid-cols-2 gap-3 text-sm">
                    <div className="space-y-1.5"><Label>Full Name</Label><Input disabled value={inlineDriverForm.full_name} /></div>
                    <div className="space-y-1.5"><Label>Phone</Label><Input disabled value={inlineDriverForm.phone} /></div>
                    <div className="space-y-1.5"><Label>Date of Birth *</Label><Input type="date" value={inlineDriverForm.date_of_birth} onChange={e => setInlineDriverForm((p:any) => ({...p, date_of_birth: e.target.value}))} /></div>
                    <div className="space-y-1.5">
                      <Label>ID Type *</Label>
                      <select className={NATIVE_SELECT_CLS} value={inlineDriverForm.id_type} onChange={e => setInlineDriverForm((p:any) => ({...p, id_type: e.target.value}))}>
                        <option value="National ID">National ID</option>
                        <option value="Passport">Passport</option>
                        <option value="Residence Permit">Residence Permit</option>
                      </select>
                    </div>
                    <div className="space-y-1.5"><Label>ID Number *</Label><Input value={inlineDriverForm.id_number} onChange={e => setInlineDriverForm((p:any) => ({...p, id_number: e.target.value}))} /></div>
                    <div className="space-y-1.5"><Label>ID Expiry</Label><Input type="date" value={inlineDriverForm.id_expiry} onChange={e => setInlineDriverForm((p:any) => ({...p, id_expiry: e.target.value}))} /></div>
                    <div className="space-y-1.5"><Label>License Number *</Label><Input value={inlineDriverForm.license_number} onChange={e => setInlineDriverForm((p:any) => ({...p, license_number: e.target.value}))} /></div>
                    <div className="space-y-1.5">
                      <Label>License Type</Label>
                      <select className={NATIVE_SELECT_CLS} value={inlineDriverForm.license_type} onChange={e => setInlineDriverForm((p:any) => ({...p, license_type: e.target.value}))}>
                        {["A","B","C","D","Other"].map(v => <option key={v} value={v}>{v}</option>)}
                      </select>
                    </div>
                    <div className="space-y-1.5"><Label>License Expiry *</Label><Input type="date" value={inlineDriverForm.license_expiry} onChange={e => setInlineDriverForm((p:any) => ({...p, license_expiry: e.target.value}))} /></div>
                    <div className="space-y-1.5"><Label>Issuing Country</Label><Input value={inlineDriverForm.license_issuing_country} onChange={e => setInlineDriverForm((p:any) => ({...p, license_issuing_country: e.target.value}))} /></div>
                    <div className="space-y-1.5"><Label>Years Experience</Label><Input type="number" min={0} value={inlineDriverForm.years_experience} onChange={e => setInlineDriverForm((p:any) => ({...p, years_experience: e.target.value}))} /></div>
                    <div className="flex items-center justify-between border rounded p-2">
                      <Label className="cursor-pointer">Previous Accidents</Label>
                      <input type="checkbox" checked={inlineDriverForm.previous_accidents} onChange={e => setInlineDriverForm((p:any) => ({...p, previous_accidents: e.target.checked}))} className="h-4 w-4" />
                    </div>
                  </div>
                  <Button type="button" onClick={handleSaveInlineDriver} disabled={inlineSaving} className="w-full">
                    {inlineSaving && <Loader2 className="h-4 w-4 animate-spin mr-2" />}
                    Register & Link Driver
                  </Button>
                </div>
              )}

              {selectedDriver && (
                <div className="border rounded-lg p-3 bg-muted/10 text-sm space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-semibold">{selectedDriver.full_name}</span>
                    <span className={`px-2 py-0.5 rounded text-xs font-bold ${
                      selectedDriver.risk_score < 40 ? 'bg-red-100 text-red-700' : 
                      selectedDriver.risk_score < 70 ? 'bg-amber-100 text-amber-700' : 'bg-emerald-100 text-emerald-700'
                    }`}>Risk Score: {selectedDriver.risk_score || 100}</span>
                  </div>
                  <div className="grid grid-cols-2 text-xs text-muted-foreground">
                    <span>License: {selectedDriver.license_number || "—"}</span>
                    <span>Expiry: {selectedDriver.license_expiry ? new Date(selectedDriver.license_expiry).toLocaleDateString() : "—"}</span>
                    <span>Rating: {selectedDriver.rating ? `⭐ ${selectedDriver.rating}` : "—"}</span>
                    <span>Status: <StatusBadge status={selectedDriver.status} /></span>
                  </div>
                </div>
              )}

              {!customerIsDriver && (
                <div className="space-y-1.5">
                  <Label>Select Registered Driver Profile</Label>
                  <select
                    className={NATIVE_SELECT_CLS}
                    value={form.driver_id || ""}
                    onChange={async (e) => {
                      const id = e.target.value;
                      set("driver_id", id);
                      setDriverWarning(null);
                      setDriverBlocked(false);
                      setSelectedDriver(null);
                      if (!id) return;
                      try {
                        const { data: d } = await supabase
                          .from("drivers")
                          .select("full_name,status,license_expiry,date_of_birth,blacklisted,risk_score,license_number,rating")
                          .eq("id", id)
                          .single();
                        if (!d) return;
                        setSelectedDriver(d);
                        const today = new Date();
                        if (d.blacklisted || d.status === "blacklisted") {
                          setDriverWarning("⛔ This person is BLACKLISTED. Rental denied.");
                          setDriverBlocked(true);
                        } else if (d.license_expiry && new Date(d.license_expiry) < today) {
                          setDriverWarning("⛔ License expired. Cannot rent until renewed.");
                          setDriverBlocked(true);
                        } else if (d.date_of_birth && selectedCar?.min_rental_age) {
                          const birth = new Date(d.date_of_birth);
                          let age = today.getFullYear() - birth.getFullYear();
                          if (today.getMonth() < birth.getMonth() || (today.getMonth() === birth.getMonth() && today.getDate() < birth.getDate())) age--;
                          if (age < selectedCar.min_rental_age) {
                            setDriverWarning(`⛔ Driver is ${age} years old. Minimum age for this car is ${selectedCar.min_rental_age}.`);
                            setDriverBlocked(true);
                          }
                        } else if (d.risk_score && d.risk_score < 40) {
                          setDriverWarning("⚠️ High risk driver — Manager approval needed");
                          setDriverBlocked(false);
                        } else if (d.status === "flagged") setDriverWarning("⚠️ This driver is FLAGGED. Rent with extra caution.");
                        else if (d.status === "pending") setDriverWarning("⚠️ Driver is PENDING review. Approval recommended before renting.");
                      } catch { }
                    }}
                  >
                    <option value="">No driver assigned</option>
                    {drivers.map((d) => (
                      <option key={d.id} value={d.id}>
                        {d.driver_code ? `${d.driver_code} — ` : ""}{d.full_name}{d.license_number ? ` — ${d.license_number}` : ""}
                      </option>
                    ))}
                  </select>
                  {driverWarning && (
                    <div className={`rounded-md p-3 text-sm font-medium border flex items-center gap-2 ${
                      driverBlocked ? "bg-red-50 border-red-300 text-red-700" : "bg-amber-50 border-amber-300 text-amber-700"
                    }`}>
                      <AlertCircle className="h-4 w-4 shrink-0" />
                      {driverWarning}
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* SECTION 2 — Dates */}
          {section(<CalendarDays className="h-4 w-4 text-primary" />, "Dates & Location")}
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5"><Label>Pickup Date *</Label><Input type="date" value={form.start_date} onChange={(e) => set("start_date", e.target.value)} min={new Date().toISOString().split("T")[0]} /></div>
            <div className="space-y-1.5"><Label>Return Date *</Label><Input type="date" value={form.end_date} onChange={(e) => set("end_date", e.target.value)} min={form.start_date || new Date().toISOString().split("T")[0]} /></div>
            <div className="space-y-1.5"><Label>Pickup Time</Label><Input type="time" value={form.pickup_time} onChange={(e) => set("pickup_time", e.target.value)} /></div>
            <div className="space-y-1.5"><Label>Return Time</Label><Input type="time" value={form.return_time} onChange={(e) => set("return_time", e.target.value)} /></div>
            <div className="space-y-1.5"><Label>Pickup Location</Label><Input placeholder="e.g. Airport Terminal 1" value={form.pickup_location} onChange={(e) => set("pickup_location", e.target.value)} /></div>
            <div className="space-y-1.5"><Label>Return Location</Label><Input placeholder="e.g. Office" value={form.return_location} onChange={(e) => set("return_location", e.target.value)} /></div>
          </div>

          {/* SECTION 3 — Pricing Summary */}
          {section(<DollarSign className="h-4 w-4 text-primary" />, "Pricing Summary")}
          {selectedCar && days > 0 ? (
            <div className="rounded-lg border bg-muted/20 p-4 space-y-2 text-sm">
              <div className="flex justify-between"><span className="text-muted-foreground">Days</span><span className="font-medium">{days}</span></div>
              <div className="flex justify-between"><span className="text-muted-foreground">Price/day</span><span>${pricePerDay}</span></div>
              <div className="flex justify-between"><span className="text-muted-foreground">Subtotal</span><span>${subtotal.toLocaleString()}</span></div>
              <div className="flex justify-between"><span className="text-muted-foreground">Security Deposit</span><span>${deposit}</span></div>
              <div className="flex justify-between items-center"><span className="text-muted-foreground">Discount</span>
                <Input type="number" min={0} className="w-28 h-7 text-right" value={form.discount_amount} onChange={(e) => set("discount_amount", e.target.value)} />
              </div>
              <div className="flex justify-between border-t pt-2 font-bold text-base"><span>Total</span><span className="text-primary">${totalAmount.toLocaleString()}</span></div>
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">Select a car and dates to see pricing.</p>
          )}

          <div className="grid grid-cols-2 gap-3 mt-3">
            <div className="space-y-1.5"><Label>Amount Paid ($)</Label><Input type="number" min={0} value={form.amount_paid} onChange={(e) => set("amount_paid", e.target.value)} /></div>
            <div className="space-y-1.5">
              <Label>Payment Method</Label>
              <Select value={form.payment_method} onValueChange={(v) => v && set("payment_method", v)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {["Cash","Card","Bank Transfer","Online"].map(v => <SelectItem key={v} value={v}>{v}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label>Payment Status</Label>
              <Select value={form.payment_status} onValueChange={(v) => v && set("payment_status", v)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {["Pending","Paid","Partial","Refunded"].map(v => <SelectItem key={v} value={v}>{v}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label>Booking Source</Label>
              <Select value={form.booking_source} onValueChange={(v) => v && set("booking_source", v)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {["Walk-in","Phone","Website","App","Agent"].map(v => <SelectItem key={v} value={v}>{v}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label>Booking Status</Label>
              <Select value={form.status} onValueChange={(v) => v && set("status", v)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {["Reserved","Active","Completed","Cancelled"].map(v => <SelectItem key={v} value={v}>{v}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* SECTION 4 — Notes */}
          <div className="space-y-1.5 mt-3">
            <Label>Notes</Label>
            <Textarea rows={2} placeholder="Special requests, flight number…" value={form.notes} onChange={(e) => set("notes", e.target.value)} />
          </div>

          <div className="flex items-center gap-2 mt-2">
            <input type="checkbox" id="terms" checked={form.terms_accepted} onChange={(e) => set("terms_accepted", e.target.checked)} className="h-4 w-4 accent-primary" />
            <Label htmlFor="terms" className="text-sm cursor-pointer">Customer has accepted rental terms & conditions</Label>
          </div>
        </div>

        {error && (
          <div className="bg-destructive/10 text-destructive text-sm p-3 rounded-md flex items-center gap-2">
            <AlertCircle className="h-4 w-4 shrink-0" />{error}
          </div>
        )}

        <DialogFooter>
          <Button variant="outline" onClick={onClose} disabled={saving}>Cancel</Button>
          <Button onClick={handleSave} disabled={saving}>
            {saving && <Loader2 className="h-4 w-4 animate-spin mr-2" />}
            {initialData?.id ? "Update Booking" : "Confirm Booking"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
