"use client";

import { useState, useRef, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { AlertCircle, Loader2, Upload, User } from "lucide-react";

const NATIVE = "flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2";

const EMPTY = {
  driver_code: "",
  full_name: "", phone: "", email: "", nationality: "",
  date_of_birth: "", gender: "", address: "", city: "",
  // Identity
  id_type: "National ID", id_number: "", id_expiry: "",
  emergency_contact: "",
  // License
  license_number: "", license_type: "B",
  license_expiry: "", license_issue_date: "",
  license_issuing_country: "", years_experience: 0,
  // Risk
  bg_check_status: "Not Checked", bg_check_date: "", bg_check_notes: "",
  previous_accidents: false, accident_notes: "",
  blacklisted: false, blacklist_reason: "",
  status: "pending",
  notes: "",
};

interface Props { open: boolean; onClose: () => void; onSaved: () => void; initialData?: any; }

export default function DriverFormModal({ open, onClose, onSaved, initialData }: Props) {
  const supabase = createClient();
  const [form, setForm] = useState<any>(initialData || EMPTY);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [photoPreview, setPhotoPreview] = useState<string>(initialData?.photo_url || "");
  const fileRef = useRef<HTMLInputElement>(null);

  const set = (k: string, v: any) => setForm((p: any) => ({ ...p, [k]: v }));

  useEffect(() => {
    async function gen() {
      if (!initialData && open) {
        try {
          const { count } = await supabase.from("drivers").select("id", { count: "exact", head: true });
          const next = (count || 0) + 1;
          setForm((p: any) => ({ ...p, driver_code: p.driver_code || `DRV-${next.toString().padStart(3, "0")}` }));
        } catch { /* ignore */ }
      }
    }
    gen();
  }, [open, initialData]);

  const handlePhoto = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onloadend = () => {
      const b64 = reader.result as string;
      setPhotoPreview(b64);
      set("photo_url", b64);
    };
    reader.readAsDataURL(file);
  };

  const handleSave = async () => {
    setError(null);
    if (!form.full_name.trim()) { setError("Full name is required."); return; }
    if (!form.phone.trim()) { setError("Phone number is required."); return; }
    if (!form.license_number.trim()) { setError("License number is required."); return; }
    setSaving(true);
    try {
      // Exact column names from the Supabase drivers table
      const payload = {
        driver_code:             form.driver_code || null,
        full_name:               form.full_name,
        phone:                   form.phone,
        email:                   form.email || null,
        nationality:             form.nationality || null,
        license_number:          form.license_number,
        license_type:            form.license_type || null,
        license_expiry:          form.license_expiry || null,
        license_issue_date:      form.license_issue_date || null,
        license_issuing_country: form.license_issuing_country || null,
        years_experience:        Number(form.years_experience) || 0,
        date_of_birth:           form.date_of_birth || null,
        gender:                  form.gender || null,
        address:                 form.address || null,
        city:                    form.city || null,
        id_type:                 form.id_type || null,
        id_number:               form.id_number || null,
        id_expiry:               form.id_expiry || null,
        emergency_contact:       form.emergency_contact || null,
        bg_check_status:         form.bg_check_status || "Not Checked",
        bg_check_date:           form.bg_check_date || null,
        bg_check_notes:          form.bg_check_notes || null,
        previous_accidents:      Boolean(form.previous_accidents),
        accident_notes:          form.accident_notes || null,
        blacklisted:             Boolean(form.blacklisted),
        blacklist_reason:        form.blacklist_reason || null,
        status:                  form.status || "pending",
        rating:                  5.0,
        risk_score:              100,
        notes:                   form.notes || null,
      };
      if (initialData?.id) {
        const { error: e } = await supabase.from("drivers").update(payload).eq("id", initialData.id);
        if (e) throw e;
      } else {
        const { error: e } = await supabase.from("drivers").insert([payload]);
        if (e) throw e;
      }
      onSaved(); onClose();
    } catch (err: any) {
      setError(err.message || "Failed to save driver. Check that all required fields are filled.");
    } finally {
      setSaving(false);
    }
  };

  const sec = (label: string) => (
    <div className="flex items-center gap-2 pt-3 pb-1 border-b mt-1 mb-2">
      <span className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">{label}</span>
    </div>
  );

  return (
    <Dialog open={open} onOpenChange={() => !saving && onClose()}>
      <DialogContent className="sm:max-w-[640px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <User className="h-5 w-5 text-primary" />
            {initialData?.id ? "Edit Driver Profile" : "Register Driver Profile"}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-1 py-1">
          {/* Photo */}
          <div className="flex justify-center mb-2">
            <div
              className="h-24 w-24 rounded-full border-2 border-dashed border-muted-foreground/30 flex items-center justify-center overflow-hidden cursor-pointer hover:border-primary/50 transition-colors bg-muted/20"
              onClick={() => fileRef.current?.click()}
            >
              {photoPreview
                ? <img src={photoPreview} alt="Photo" className="w-full h-full object-cover" />
                : <div className="text-center"><Upload className="h-6 w-6 text-muted-foreground/50 mx-auto mb-1" /><p className="text-xs text-muted-foreground">Photo</p></div>
              }
            </div>
            <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handlePhoto} />
          </div>

          {sec("Personal Information")}
          <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <Label>Driver Code <span className="text-muted-foreground text-xs">(system)</span></Label>
                  <Input className="font-mono" placeholder="DRV-001" value={form.driver_code} onChange={e => set("driver_code", e.target.value)} />
                </div>
                <div className="space-y-1.5">
                  <Label>Full Name *</Label>
                  <Input placeholder="John Doe" value={form.full_name} onChange={e => set("full_name", e.target.value)} />
                </div>
                <div className="space-y-1.5">
                  <Label>Phone *</Label>
                  <Input placeholder="+1 234 567 8900" value={form.phone} onChange={e => set("phone", e.target.value)} />
                </div>
                <div className="space-y-1.5">
                  <Label>Email</Label>
                  <Input type="email" placeholder="john@example.com" value={form.email} onChange={e => set("email", e.target.value)} />
                </div>
                <div className="space-y-1.5"><Label>Date of Birth</Label><Input type="date" value={form.date_of_birth} onChange={e => set("date_of_birth", e.target.value)} /></div>
            <div className="space-y-1.5"><Label>Nationality</Label><Input value={form.nationality} onChange={e => set("nationality", e.target.value)} placeholder="e.g. British" /></div>
            <div className="space-y-1.5">
              <Label>Gender</Label>
              <select className={NATIVE} value={form.gender} onChange={e => set("gender", e.target.value)}>
                <option value="">Select…</option>
                <option>Male</option><option>Female</option><option>Other</option>
              </select>
            </div>
            <div className="space-y-1.5"><Label>Emergency Contact</Label><Input value={form.emergency_contact} onChange={e => set("emergency_contact", e.target.value)} placeholder="Name & phone" /></div>
            <div className="space-y-1.5"><Label>Address</Label><Input value={form.address} onChange={e => set("address", e.target.value)} placeholder="Street address" /></div>
            <div className="space-y-1.5"><Label>City</Label><Input value={form.city} onChange={e => set("city", e.target.value)} placeholder="City" /></div>
          </div>

          {sec("Identity Document")}
          <div className="grid grid-cols-3 gap-3">
            <div className="space-y-1.5">
              <Label>ID Type</Label>
              <select className={NATIVE} value={form.id_type} onChange={e => set("id_type", e.target.value)}>
                <option>National ID</option>
                <option>Passport</option>
                <option>Residence Permit</option>
              </select>
            </div>
            <div className="space-y-1.5"><Label>ID Number</Label><Input className="font-mono" value={form.id_number} onChange={e => set("id_number", e.target.value)} /></div>
            <div className="space-y-1.5"><Label>ID Expiry</Label><Input type="date" value={form.id_expiry} onChange={e => set("id_expiry", e.target.value)} /></div>
          </div>

          {sec("Driving License")}
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5"><Label>License Number *</Label><Input className="font-mono uppercase" value={form.license_number} onChange={e => set("license_number", e.target.value.toUpperCase())} /></div>
            <div className="space-y-1.5">
              <Label>License Type</Label>
              <select className={NATIVE} value={form.license_type} onChange={e => set("license_type", e.target.value)}>
                {["A","B","C","D"].map(v => <option key={v} value={v}>Class {v}</option>)}
              </select>
            </div>
            <div className="space-y-1.5"><Label>Issue Date</Label><Input type="date" value={form.license_issue_date} onChange={e => set("license_issue_date", e.target.value)} /></div>
            <div className="space-y-1.5"><Label>Expiry Date</Label><Input type="date" value={form.license_expiry} onChange={e => set("license_expiry", e.target.value)} /></div>
            <div className="space-y-1.5"><Label>Issuing Country</Label><Input value={form.license_issuing_country} onChange={e => set("license_issuing_country", e.target.value)} /></div>
            <div className="space-y-1.5"><Label>Years of Experience</Label><Input type="number" min={0} value={form.years_experience} onChange={e => set("years_experience", e.target.value)} /></div>
          </div>

          {sec("Risk Assessment (Staff Only)")}
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label>Background Check</Label>
              <select className={NATIVE} value={form.bg_check_status} onChange={e => set("bg_check_status", e.target.value)}>
                {["Not Checked","Clear","Has Record"].map(v => <option key={v}>{v}</option>)}
              </select>
            </div>
            <div className="space-y-1.5"><Label>BG Check Date</Label><Input type="date" value={form.bg_check_date} onChange={e => set("bg_check_date", e.target.value)} /></div>
            <div className="col-span-2 space-y-1.5"><Label>BG Check Notes</Label><Input value={form.bg_check_notes} onChange={e => set("bg_check_notes", e.target.value)} placeholder="Notes from background check…" /></div>
            <div className="space-y-1.5">
              <Label>Driver Status</Label>
              <select className={NATIVE} value={form.status} onChange={e => set("status", e.target.value)}>
                {["pending","approved","flagged","blacklisted"].map(v => <option key={v} value={v}>{v.charAt(0).toUpperCase() + v.slice(1)}</option>)}
              </select>
            </div>
          </div>

          <div className="flex items-center justify-between rounded-lg border p-3 bg-muted/20 mt-2">
            <div><p className="text-sm font-medium">Previous Accidents</p><p className="text-xs text-muted-foreground">Has this person had accidents before?</p></div>
            <Switch checked={form.previous_accidents} onCheckedChange={v => set("previous_accidents", v)} />
          </div>
          {form.previous_accidents && (
            <div className="space-y-1.5"><Label>Accident Notes</Label><Textarea rows={2} value={form.accident_notes} onChange={e => set("accident_notes", e.target.value)} placeholder="Describe incidents…" /></div>
          )}

          <div className="flex items-center justify-between rounded-lg border p-3 bg-red-50 border-red-200 mt-2">
            <div><p className="text-sm font-medium text-red-700">Blacklisted</p><p className="text-xs text-red-500">This person is banned from renting.</p></div>
            <Switch checked={form.blacklisted} onCheckedChange={v => { set("blacklisted", v); if (v) set("status", "blacklisted"); }} />
          </div>
          {form.blacklisted && (
            <div className="space-y-1.5"><Label>Blacklist Reason *</Label><Textarea rows={2} value={form.blacklist_reason} onChange={e => set("blacklist_reason", e.target.value)} placeholder="Reason for blacklisting…" /></div>
          )}

          <div className="space-y-1.5 mt-2"><Label>Internal Notes</Label><Textarea rows={2} value={form.notes} onChange={e => set("notes", e.target.value)} placeholder="Internal staff notes…" /></div>
        </div>

        {error && (
          <div className="bg-destructive/10 text-destructive text-sm p-3 rounded flex items-center gap-2">
            <AlertCircle className="h-4 w-4 shrink-0" />{error}
          </div>
        )}
        <DialogFooter>
          <Button variant="outline" onClick={onClose} disabled={saving}>Cancel</Button>
          <Button onClick={handleSave} disabled={saving}>
            {saving && <Loader2 className="h-4 w-4 animate-spin mr-2" />}
            {initialData?.id ? "Update Profile" : "Register Driver"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
