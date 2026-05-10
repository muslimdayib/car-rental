"use client";

import { useState, useRef, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { AlertCircle, Car, CheckCircle, ChevronLeft, ChevronRight, Loader2, Upload } from "lucide-react";

const STEPS = ["Basic Info", "ID & Registration", "Financial", "Review"];

const EMPTY_FORM = {
  id: "",
  image_url: "",
  brand: "",
  model: "",
  year: new Date().getFullYear(),
  color: "",
  body_type: "",
  seats: 5,
  fuel_type: "",
  engine_size: "",
  transmission: "",
  drive_type: "",
  condition: "Good",
  notes: "",
  plate_number: "",
  chassis_number: "",
  engine_number: "",
  gps_tracker_id: "",
  registration_number: "",
  registration_date: "",
  registration_expiry: "",
  road_tax_expiry: "",
  fitness_certificate_expiry: "",
  previous_owners: 0,
  accident_history: false,
  purchase_price: "",
  purchase_date: "",
  depreciation_rate: 20,
  price_per_day: "",
  price_per_week: "",
  price_per_month: "",
  security_deposit: "",
  min_rental_age: 21,
  mileage: "",
  status: "Available",
  fleet_number: "",
  car_code: "",
};

interface CarFormModalProps {
  open: boolean;
  onClose: () => void;
  onSaved: () => void;
  initialData?: any;
}

export default function CarFormModal({ open, onClose, onSaved, initialData }: CarFormModalProps) {
  const [step, setStep] = useState(0);
  const [formData, setFormData] = useState<any>(initialData || EMPTY_FORM);
  const [isSaving, setIsSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [imagePreview, setImagePreview] = useState<string>(initialData?.image_url || "");
  const fileInputRef = useRef<HTMLInputElement>(null);
  const supabase = createClient();

  const set = (key: string, val: any) => setFormData((p: any) => ({ ...p, [key]: val }));

  // Fix 4 — Auto generate fleet number and car code for new cars
  useEffect(() => {
    async function gen() {
      if (!initialData && open) {
        try {
          const { count } = await supabase.from("cars").select("id", { count: "exact", head: true });
          const next = (count || 0) + 1;
          const padded = next.toString().padStart(3, "0");
          setFormData((p: any) => ({
            ...p,
            fleet_number: p.fleet_number || `FL-${padded}`,
            car_code: p.car_code || `CAR-${new Date().getFullYear()}-${padded}`
          }));
        } catch { /* ignore */ }
      }
    }
    gen();
  }, [open, initialData]);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onloadend = () => {
      const base64 = reader.result as string;
      setImagePreview(base64);
      set("image_url", base64);
    };
    reader.readAsDataURL(file);
  };

  const validateStep = (): string | null => {
    if (step === 0) {
      if (!formData.brand.trim()) return "Brand is required";
      if (!formData.model.trim()) return "Model is required";
      if (!formData.year || formData.year < 1990 || formData.year > 2026) return "Valid year (1990–2026) is required";
    }
    if (step === 1) {
      if (!formData.plate_number.trim()) return "Plate number is required";
    }
    if (step === 2) {
      if (!formData.purchase_price || Number(formData.purchase_price) <= 0) return "Purchase price is required";
      if (!formData.price_per_day || Number(formData.price_per_day) <= 0) return "Price per day is required";
    }
    return null;
  };

  const handleNext = () => {
    const err = validateStep();
    if (err) { setSaveError(err); return; }
    setSaveError(null);
    setStep((s) => Math.min(s + 1, 3));
  };

  const handleBack = () => {
    setSaveError(null);
    setStep((s) => Math.max(s - 1, 0));
  };

  const handleSave = async () => {
    setIsSaving(true);
    setSaveError(null);
    try {
      const payload: any = {
        name: `${formData.brand} ${formData.model}`,
        brand: formData.brand,
        model: formData.model,
        year: Number(formData.year),
        color: formData.color,
        body_type: formData.body_type,
        seats: Number(formData.seats) || null,
        fuel_type: formData.fuel_type,
        engine_size: formData.engine_size,
        transmission: formData.transmission,
        drive_type: formData.drive_type,
        condition: formData.condition,
        notes: formData.notes,
        plate_number: formData.plate_number.toUpperCase(),
        chassis_number: formData.chassis_number,
        engine_number: formData.engine_number,
        gps_tracker_id: formData.gps_tracker_id,
        registration_number: formData.registration_number,
        registration_date: formData.registration_date || null,
        registration_expiry: formData.registration_expiry || null,
        road_tax_expiry: formData.road_tax_expiry || null,
        fitness_certificate_expiry: formData.fitness_certificate_expiry || null,
        previous_owners: Number(formData.previous_owners) || 0,
        accident_history: Boolean(formData.accident_history),
        purchase_price: Number(formData.purchase_price) || null,
        purchase_date: formData.purchase_date || null,
        depreciation_rate: Number(formData.depreciation_rate) || 20,
        price_per_day: Number(formData.price_per_day),
        price_per_week: Number(formData.price_per_week) || null,
        price_per_month: Number(formData.price_per_month) || null,
        security_deposit: Number(formData.security_deposit) || null,
        min_rental_age: Number(formData.min_rental_age) || 21,
        mileage: Number(formData.mileage) || 0,
        image_url: formData.image_url || null,
        status: formData.status || "Available",
        fleet_number: formData.fleet_number || null,
        car_code: formData.car_code || null,
      };

      if (formData.id) {
        const { error } = await supabase.from("cars").update(payload).eq("id", formData.id);
        if (error) throw error;
      } else {
        const { error } = await supabase.from("cars").insert([payload]);
        if (error) throw error;
      }

      onSaved();
      onClose();
    } catch (err: any) {
      setSaveError(err.message || "Failed to save car");
    } finally {
      setIsSaving(false);
    }
  };

  const handleClose = () => {
    setStep(0);
    setSaveError(null);
    setImagePreview("");
    onClose();
  };

  // Book value preview for review step
  const currentYear = new Date().getFullYear();
  const years1 = Math.max(0, currentYear - (Number(formData.year) || currentYear));
  const rate = (Number(formData.depreciation_rate) || 0) / 100;
  const pPrice = Number(formData.purchase_price) || 0;
  const bookValueNow = Math.max(0, pPrice - pPrice * rate * years1);
  const bookValue3yr = Math.max(0, pPrice - pPrice * rate * (years1 + 3));

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[680px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Car className="h-5 w-5 text-primary" />
            {formData.id ? "Edit Vehicle" : "Register New Vehicle"}
          </DialogTitle>
        </DialogHeader>

        {/* Step Indicator */}
        <div className="flex items-center gap-1 mt-1">
          {STEPS.map((label, i) => (
            <div key={i} className="flex items-center flex-1">
              <div className={`flex items-center gap-1.5 flex-1 ${i <= step ? "text-primary" : "text-muted-foreground"}`}>
                <div className={`h-7 w-7 rounded-full flex items-center justify-center text-xs font-bold border-2 shrink-0 transition-colors ${
                  i < step ? "bg-primary border-primary text-primary-foreground" :
                  i === step ? "border-primary text-primary" :
                  "border-muted-foreground/30 text-muted-foreground"
                }`}>
                  {i < step ? <CheckCircle className="h-4 w-4" /> : i + 1}
                </div>
                <span className="text-xs font-medium hidden sm:block">{label}</span>
              </div>
              {i < STEPS.length - 1 && (
                <div className={`h-0.5 w-full mx-1 transition-colors ${i < step ? "bg-primary" : "bg-muted"}`} />
              )}
            </div>
          ))}
        </div>

        <div className="py-2 space-y-4">
          {/* STEP 1 — Basic Info */}
          {step === 0 && (
            <div className="space-y-4">
              {/* Image Upload */}
              <div className="space-y-2">
                <Label>Car Photo</Label>
                <div
                  className="w-full h-36 rounded-lg border-2 border-dashed border-muted-foreground/30 bg-muted/20 flex flex-col items-center justify-center cursor-pointer hover:border-primary/50 transition-colors overflow-hidden"
                  onClick={() => fileInputRef.current?.click()}
                >
                  {imagePreview ? (
                    <img src={imagePreview} alt="Preview" className="w-full h-full object-cover" />
                  ) : (
                    <>
                      <Upload className="h-8 w-8 text-muted-foreground/50 mb-2" />
                      <p className="text-sm text-muted-foreground">Click to upload car photo</p>
                    </>
                  )}
                </div>
                <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handleImageUpload} />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Brand *</Label>
                  <Input placeholder="e.g. Toyota" value={formData.brand} onChange={(e) => set("brand", e.target.value)} />
                </div>
                <div className="space-y-2">
                  <Label>Model *</Label>
                  <Input placeholder="e.g. Camry" value={formData.model} onChange={(e) => set("model", e.target.value)} />
                </div>
              </div>

              {/* Fix 2 — Fleet Number & Car ID */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Fleet Number <span className="text-muted-foreground text-xs">(internal)</span></Label>
                  <Input placeholder="e.g. FL-001" className="font-mono" value={formData.fleet_number} onChange={(e) => set("fleet_number", e.target.value)} />
                </div>
                <div className="space-y-2">
                  <Label>Car ID Number <span className="text-muted-foreground text-xs">(system)</span></Label>
                  <Input placeholder="e.g. CAR-2026-001" className="font-mono" value={formData.car_code} onChange={(e) => set("car_code", e.target.value)} />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label>Year *</Label>
                  <Input type="number" min={1990} max={2026} value={formData.year} onChange={(e) => set("year", e.target.value)} />
                </div>
                <div className="space-y-2">
                  <Label>Color</Label>
                  <Input placeholder="e.g. Black" value={formData.color} onChange={(e) => set("color", e.target.value)} />
                </div>
                <div className="space-y-2">
                  <Label>Seats</Label>
                  <Input type="number" min={1} max={50} value={formData.seats} onChange={(e) => set("seats", e.target.value)} />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Body Type</Label>
                  <Select value={formData.body_type} onValueChange={(v) => set("body_type", v)}>
                    <SelectTrigger><SelectValue placeholder="Select body type" /></SelectTrigger>
                    <SelectContent>
                      {["Sedan","SUV","Van","Pickup","Coupe","Convertible","Hatchback","Minivan"].map(v => <SelectItem key={v} value={v}>{v}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Fuel Type</Label>
                  <Select value={formData.fuel_type} onValueChange={(v) => set("fuel_type", v)}>
                    <SelectTrigger><SelectValue placeholder="Select fuel" /></SelectTrigger>
                    <SelectContent>
                      {["Petrol","Diesel","Hybrid","Electric","LPG"].map(v => <SelectItem key={v} value={v}>{v}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label>Engine Size</Label>
                  <Input placeholder="e.g. 2.0L" value={formData.engine_size} onChange={(e) => set("engine_size", e.target.value)} />
                </div>
                <div className="space-y-2">
                  <Label>Transmission</Label>
                  <Select value={formData.transmission} onValueChange={(v) => set("transmission", v)}>
                    <SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Automatic">Automatic</SelectItem>
                      <SelectItem value="Manual">Manual</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Drive Type</Label>
                  <Select value={formData.drive_type} onValueChange={(v) => set("drive_type", v)}>
                    <SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="2WD">2WD</SelectItem>
                      <SelectItem value="4WD">4WD</SelectItem>
                      <SelectItem value="AWD">AWD</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Condition</Label>
                  <Select value={formData.condition} onValueChange={(v) => set("condition", v)}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {["Excellent","Good","Fair","Poor"].map(v => <SelectItem key={v} value={v}>{v}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Current Mileage (km)</Label>
                  <Input type="number" placeholder="e.g. 15000" value={formData.mileage} onChange={(e) => set("mileage", e.target.value)} />
                </div>
              </div>

              <div className="space-y-2">
                <Label>Notes</Label>
                <Textarea placeholder="Any additional notes about the vehicle..." value={formData.notes} onChange={(e) => set("notes", e.target.value)} rows={2} />
              </div>
            </div>
          )}

          {/* STEP 2 — Identification & Registration */}
          {step === 1 && (
            <div className="space-y-4">
              <p className="text-sm text-muted-foreground font-medium uppercase tracking-wide">Identification</p>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Plate Number *</Label>
                  <Input placeholder="ABC-1234" className="font-mono uppercase" value={formData.plate_number} onChange={(e) => set("plate_number", e.target.value.toUpperCase())} />
                </div>
                <div className="space-y-2">
                  <Label>Chassis / VIN</Label>
                  <Input placeholder="VIN number" value={formData.chassis_number} onChange={(e) => set("chassis_number", e.target.value)} />
                </div>
                <div className="space-y-2">
                  <Label>Engine Number</Label>
                  <Input placeholder="Engine serial" value={formData.engine_number} onChange={(e) => set("engine_number", e.target.value)} />
                </div>
                <div className="space-y-2">
                  <Label>GPS Tracker ID</Label>
                  <Input placeholder="Tracker ID" value={formData.gps_tracker_id} onChange={(e) => set("gps_tracker_id", e.target.value)} />
                </div>
              </div>

              <p className="text-sm text-muted-foreground font-medium uppercase tracking-wide pt-2">Registration Details</p>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Registration Number</Label>
                  <Input value={formData.registration_number} onChange={(e) => set("registration_number", e.target.value)} />
                </div>
                <div className="space-y-2">
                  <Label>Registration Date</Label>
                  <Input type="date" value={formData.registration_date} onChange={(e) => set("registration_date", e.target.value)} />
                </div>
                <div className="space-y-2">
                  <Label>Registration Expiry</Label>
                  <Input type="date" value={formData.registration_expiry} onChange={(e) => set("registration_expiry", e.target.value)} />
                </div>
                <div className="space-y-2">
                  <Label>Road Tax Expiry</Label>
                  <Input type="date" value={formData.road_tax_expiry} onChange={(e) => set("road_tax_expiry", e.target.value)} />
                </div>
                <div className="space-y-2">
                  <Label>Fitness Certificate Expiry</Label>
                  <Input type="date" value={formData.fitness_certificate_expiry} onChange={(e) => set("fitness_certificate_expiry", e.target.value)} />
                </div>
                <div className="space-y-2">
                  <Label>Previous Owners</Label>
                  <Input type="number" min={0} value={formData.previous_owners} onChange={(e) => set("previous_owners", e.target.value)} />
                </div>
              </div>

              <div className="flex items-center justify-between rounded-lg border p-3 bg-muted/20">
                <div>
                  <p className="text-sm font-medium">Accident History</p>
                  <p className="text-xs text-muted-foreground">Has this vehicle been in an accident?</p>
                </div>
                <Switch checked={formData.accident_history} onCheckedChange={(v) => set("accident_history", v)} />
              </div>
            </div>
          )}

          {/* STEP 3 — Financial & Pricing */}
          {step === 2 && (
            <div className="space-y-4">
              <p className="text-sm text-muted-foreground font-medium uppercase tracking-wide">Purchase Details</p>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Purchase Price ($) *</Label>
                  <Input type="number" placeholder="0.00" value={formData.purchase_price} onChange={(e) => set("purchase_price", e.target.value)} />
                </div>
                <div className="space-y-2">
                  <Label>Purchase Date</Label>
                  <Input type="date" value={formData.purchase_date} onChange={(e) => set("purchase_date", e.target.value)} />
                </div>
                <div className="space-y-2">
                  <Label>Depreciation Rate (%)</Label>
                  <Input type="number" min={0} max={100} value={formData.depreciation_rate} onChange={(e) => set("depreciation_rate", e.target.value)} />
                </div>
              </div>

              <p className="text-sm text-muted-foreground font-medium uppercase tracking-wide pt-2">Rental Pricing</p>
              <div className="grid grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label>Price / Day ($) *</Label>
                  <Input type="number" placeholder="0.00" value={formData.price_per_day} onChange={(e) => set("price_per_day", e.target.value)} />
                </div>
                <div className="space-y-2">
                  <Label>Price / Week ($)</Label>
                  <Input type="number" placeholder="0.00" value={formData.price_per_week} onChange={(e) => set("price_per_week", e.target.value)} />
                </div>
                <div className="space-y-2">
                  <Label>Price / Month ($)</Label>
                  <Input type="number" placeholder="0.00" value={formData.price_per_month} onChange={(e) => set("price_per_month", e.target.value)} />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Security Deposit ($)</Label>
                  <Input type="number" placeholder="0.00" value={formData.security_deposit} onChange={(e) => set("security_deposit", e.target.value)} />
                </div>
                <div className="space-y-2">
                  <Label>Minimum Rental Age</Label>
                  <Input type="number" min={16} max={99} value={formData.min_rental_age} onChange={(e) => set("min_rental_age", e.target.value)} />
                </div>
              </div>
            </div>
          )}

          {/* STEP 4 — Review */}
          {step === 3 && (
            <div className="space-y-4">
              <div className="rounded-lg border bg-muted/10 divide-y">
                {/* Image */}
                {imagePreview && (
                  <div className="h-40 overflow-hidden rounded-t-lg">
                    <img src={imagePreview} alt="Car" className="w-full h-full object-cover" />
                  </div>
                )}
                <div className="p-4 grid grid-cols-2 gap-x-4 gap-y-2 text-sm">
                  <ReviewRow label="Vehicle" value={`${formData.brand} ${formData.model}`} />
                  <ReviewRow label="Year" value={String(formData.year)} />
                  <ReviewRow label="Color" value={formData.color} />
                  <ReviewRow label="Plate" value={formData.plate_number} mono />
                  <ReviewRow label="Fuel" value={formData.fuel_type} />
                  <ReviewRow label="Transmission" value={formData.transmission} />
                  <ReviewRow label="Seats" value={String(formData.seats)} />
                  <ReviewRow label="Condition" value={formData.condition} />
                </div>
                <div className="p-4 grid grid-cols-2 gap-x-4 gap-y-2 text-sm">
                  <ReviewRow label="Purchase Price" value={pPrice ? `$${Number(pPrice).toLocaleString()}` : "—"} />
                  <ReviewRow label="Depreciation Rate" value={`${formData.depreciation_rate}%`} />
                  <ReviewRow label="Price / Day" value={formData.price_per_day ? `$${formData.price_per_day}` : "—"} />
                </div>
                {/* Depreciation Preview */}
                {pPrice > 0 && (
                  <div className="p-4 space-y-2 bg-muted/20 rounded-b-lg">
                    <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Depreciation Preview</p>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="rounded-md bg-background border p-3 text-center">
                        <p className="text-xs text-muted-foreground">Current Book Value</p>
                        <p className="text-lg font-bold text-primary">${Math.round(bookValueNow).toLocaleString()}</p>
                      </div>
                      <div className="rounded-md bg-background border p-3 text-center">
                        <p className="text-xs text-muted-foreground">Value in 3 Years</p>
                        <p className="text-lg font-bold">${Math.round(bookValue3yr).toLocaleString()}</p>
                      </div>
                    </div>
                    <div className="w-full h-2 bg-muted rounded-full overflow-hidden mt-2">
                      <div
                        className="h-full bg-primary rounded-full"
                        style={{ width: `${Math.max(0, Math.min(100, (bookValueNow / pPrice) * 100))}%` }}
                      />
                    </div>
                    <p className="text-xs text-muted-foreground text-right">
                      {pPrice > 0 ? Math.round((bookValueNow / pPrice) * 100) : 0}% remaining value
                    </p>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Error */}
        {saveError && (
          <div className="bg-destructive/10 text-destructive text-sm p-3 rounded-md flex items-center gap-2">
            <AlertCircle className="h-4 w-4 shrink-0" />
            {saveError}
          </div>
        )}

        {/* Navigation */}
        <div className="flex justify-between pt-2 border-t">
          <Button variant="outline" onClick={step === 0 ? handleClose : handleBack} disabled={isSaving}>
            {step === 0 ? "Cancel" : <><ChevronLeft className="h-4 w-4 mr-1" />Back</>}
          </Button>
          {step < 3 ? (
            <Button onClick={handleNext}>
              Next <ChevronRight className="h-4 w-4 ml-1" />
            </Button>
          ) : (
            <Button onClick={handleSave} disabled={isSaving} className="min-w-[120px]">
              {isSaving ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <CheckCircle className="h-4 w-4 mr-2" />}
              {formData.id ? "Update Vehicle" : "Save Vehicle"}
            </Button>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}

function ReviewRow({ label, value, mono }: { label: string; value: string; mono?: boolean }) {
  if (!value) return null;
  return (
    <div>
      <p className="text-muted-foreground text-xs">{label}</p>
      <p className={`font-medium ${mono ? "font-mono" : ""}`}>{value}</p>
    </div>
  );
}
