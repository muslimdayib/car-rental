"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { AlertCircle, Loader2 } from "lucide-react";

const NATIVE = "flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2";

interface Props {
  bookingId: string | null;
  onClose: () => void;
  onSaved: () => void;
}

export default function AssignDriverModal({ bookingId, onClose, onSaved }: Props) {
  const supabase = createClient();
  const [drivers, setDrivers] = useState<any[]>([]);
  const [selectedDriverId, setSelectedDriverId] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [customer, setCustomer] = useState<any>(null);
  const [inlineForm, setInlineForm] = useState<any>(null);
  const [inlineMsg, setInlineMsg] = useState<{type: "success"|"error"|"info"|"warning", text: string} | null>(null);
  const [inlineSaving, setInlineSaving] = useState(false);

  useEffect(() => {
    if (!bookingId) return;
    async function load() {
      try {
        const [dRes, bRes] = await Promise.all([
          supabase.from("drivers").select("id, full_name, phone, license_number, status, driver_code").not("status", "eq", "blacklisted").order("full_name"),
          supabase.from("bookings").select("customers(id, full_name, phone, email)").eq("id", bookingId).single()
        ]);
        setDrivers(dRes.data || []);
        if (bRes.data?.customers) setCustomer(bRes.data.customers);
      } catch (err: any) {
        setError(err.message);
      }
    }
    load();
  }, [bookingId]);

  const handleCheckCustomer = async () => {
    if (!customer?.phone) {
      setInlineMsg({ type: "warning", text: "Customer missing phone number." });
      return;
    }
    setInlineMsg({ type: "info", text: "Checking driver profile..." });
    const { data } = await supabase.from("drivers").select("*").eq("phone", customer.phone).single();
    if (data) {
      setInlineMsg({ type: "success", text: "✅ Driver profile found and linked automatically" });
      setSelectedDriverId(data.id);
      setInlineForm(null);
    } else {
      setInlineMsg({ type: "info", text: "No driver profile found. Please create one below." });
      setInlineForm({
        full_name: customer.full_name,
        phone: customer.phone,
        email: customer.email || "",
        date_of_birth: "",
        id_type: "National ID",
        id_number: "",
        id_expiry: "",
        license_number: "",
        license_type: "B",
        license_expiry: "",
        license_issuing_country: "",
        years_experience: 0,
        previous_accidents: false
      });
      setSelectedDriverId("");
    }
  };

  const handleSaveInline = async () => {
    if (!inlineForm.date_of_birth) { setInlineMsg({ type: "error", text: "Date of Birth is required" }); return; }
    if (!inlineForm.id_number) { setInlineMsg({ type: "error", text: "ID Number is required" }); return; }
    if (!inlineForm.license_number) { setInlineMsg({ type: "error", text: "License Number is required" }); return; }
    if (!inlineForm.license_expiry) { setInlineMsg({ type: "error", text: "License Expiry is required" }); return; }
    
    setInlineSaving(true);
    try {
      const payload = {
        ...inlineForm,
        years_experience: Number(inlineForm.years_experience) || 0,
        status: "pending",
        rating: 5.0,
        risk_score: 100,
      };
      const { data, error: e } = await supabase.from("drivers").insert([payload]).select().single();
      if (e) throw e;
      
      setSelectedDriverId(data.id);
      setInlineForm(null);
      setInlineMsg({ type: "success", text: "✅ Driver profile created and linked" });
    } catch (err: any) {
      setInlineMsg({ type: "error", text: err.message || "Failed to create profile" });
    } finally {
      setInlineSaving(false);
    }
  };

  const handleSave = async () => {
    setError(null);
    setSaving(true);
    try {
      const { error: e } = await supabase
        .from("bookings")
        .update({ driver_id: selectedDriverId || null })
        .eq("id", bookingId!);
      if (e) throw e;
      onSaved();
      onClose();
    } catch (err: any) {
      setError(err.message || "Failed to assign driver");
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open={!!bookingId} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="sm:max-w-[400px]">
        <DialogHeader>
          <DialogTitle>Assign Driver Profile</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 py-2">
          {customer && (
            <div className="bg-muted/30 p-3 rounded-lg border space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Customer: {customer.full_name}</span>
                <Button size="sm" variant="outline" onClick={handleCheckCustomer} className="h-7 text-xs">
                  Set Customer as Driver
                </Button>
              </div>
              
              {inlineMsg && (
                <div className={`p-2 rounded text-xs flex items-start gap-1.5 border ${
                  inlineMsg.type === "success" ? "bg-emerald-50 text-emerald-700 border-emerald-200" :
                  inlineMsg.type === "error" ? "bg-destructive/10 text-destructive border-destructive/20" :
                  inlineMsg.type === "warning" ? "bg-amber-50 text-amber-700 border-amber-200" :
                  "bg-blue-50 text-blue-700 border-blue-200"
                }`}>
                  {inlineMsg.type === "error" || inlineMsg.type === "warning" ? <AlertCircle className="h-3 w-3 mt-0.5 shrink-0" /> : null}
                  <div>{inlineMsg.text}</div>
                </div>
              )}

              {inlineForm && (
                <div className="border rounded bg-background p-3 space-y-3 mt-2">
                  <h4 className="font-semibold text-xs">Complete Driver Registration</h4>
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <div className="space-y-1"><Label className="text-xs">Date of Birth *</Label><Input type="date" className="h-8 text-xs" value={inlineForm.date_of_birth} onChange={e => setInlineForm((p:any)=>({...p, date_of_birth: e.target.value}))} /></div>
                    <div className="space-y-1"><Label className="text-xs">ID Type *</Label>
                      <select className="flex h-8 w-full rounded-md border border-input bg-background px-2 py-1 text-xs" value={inlineForm.id_type} onChange={e => setInlineForm((p:any)=>({...p, id_type: e.target.value}))}>
                        <option>National ID</option><option>Passport</option><option>Residence Permit</option>
                      </select>
                    </div>
                    <div className="space-y-1"><Label className="text-xs">ID Number *</Label><Input className="h-8 text-xs" value={inlineForm.id_number} onChange={e => setInlineForm((p:any)=>({...p, id_number: e.target.value}))} /></div>
                    <div className="space-y-1"><Label className="text-xs">ID Expiry</Label><Input type="date" className="h-8 text-xs" value={inlineForm.id_expiry} onChange={e => setInlineForm((p:any)=>({...p, id_expiry: e.target.value}))} /></div>
                    <div className="space-y-1"><Label className="text-xs">License Number *</Label><Input className="h-8 text-xs" value={inlineForm.license_number} onChange={e => setInlineForm((p:any)=>({...p, license_number: e.target.value}))} /></div>
                    <div className="space-y-1"><Label className="text-xs">License Expiry *</Label><Input type="date" className="h-8 text-xs" value={inlineForm.license_expiry} onChange={e => setInlineForm((p:any)=>({...p, license_expiry: e.target.value}))} /></div>
                    <div className="space-y-1"><Label className="text-xs">Years Experience</Label><Input type="number" className="h-8 text-xs" value={inlineForm.years_experience} onChange={e => setInlineForm((p:any)=>({...p, years_experience: e.target.value}))} /></div>
                    <div className="flex items-center gap-2 mt-4">
                      <input type="checkbox" checked={inlineForm.previous_accidents} onChange={e => setInlineForm((p:any)=>({...p, previous_accidents: e.target.checked}))} />
                      <Label className="text-xs">Prev. Accidents</Label>
                    </div>
                  </div>
                  <Button type="button" size="sm" onClick={handleSaveInline} disabled={inlineSaving} className="w-full h-8 text-xs">
                    {inlineSaving && <Loader2 className="h-3 w-3 animate-spin mr-2" />} Register & Link
                  </Button>
                </div>
              )}
            </div>
          )}

          <div className="space-y-1.5">
            <Label>Or Select Registered Driver</Label>
            <select
              className={NATIVE}
              value={selectedDriverId}
              onChange={(e) => {
                setSelectedDriverId(e.target.value);
                setInlineForm(null);
                setInlineMsg(null);
              }}
            >
              <option value="">No driver (customer is driver)</option>
              {drivers.map((d) => (
                <option key={d.id} value={d.id}>
                  {d.driver_code ? `${d.driver_code} — ` : ""}{d.full_name} — {d.phone}{d.license_number ? ` (${d.license_number})` : ""}
                </option>
              ))}
            </select>
          </div>
          {error && (
            <div className="bg-destructive/10 text-destructive text-sm p-3 rounded flex items-center gap-2">
              <AlertCircle className="h-4 w-4 shrink-0" />{error}
            </div>
          )}
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose} disabled={saving}>Cancel</Button>
          <Button onClick={handleSave} disabled={saving}>
            {saving && <Loader2 className="h-4 w-4 animate-spin mr-2" />}
            Save Assignment
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
