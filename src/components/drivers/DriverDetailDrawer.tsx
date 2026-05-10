"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import { Driver, calculateAge, computeRiskScore, riskLabel, statusDisplay } from "@/lib/hooks/useDrivers";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import {
  AlertCircle, CheckCircle2, Loader2, Shield, ShieldOff,
  Star, AlertTriangle, XCircle,
} from "lucide-react";

interface Props { driver: Driver | null; onClose: () => void; onRefetch: () => void; }

/* ── Shared helpers ── */
function InfoRow({ label, value }: { label: string; value?: string | null | React.ReactNode }) {
  if (!value && value !== 0) return null;
  return (
    <div className="flex justify-between text-sm py-1.5 border-b border-dashed border-muted/50 last:border-0">
      <span className="text-muted-foreground shrink-0 mr-3">{label}</span>
      <span className="font-medium text-right">{value}</span>
    </div>
  );
}

function RiskMeter({ driver }: { driver: Driver }) {
  try {
    const score = computeRiskScore(driver);
    const { label, color, bg, message } = riskLabel(score);
    const barColor = score >= 80 ? "bg-emerald-500" : score >= 60 ? "bg-amber-500" : score >= 40 ? "bg-orange-500" : "bg-red-500";
    return (
      <div className={`rounded-lg border p-4 ${bg}`}>
        <div className="flex justify-between items-center mb-2">
          <span className={`text-sm font-bold ${color}`}>{label}</span>
          <span className={`text-2xl font-black ${color}`}>{score}<span className="text-xs font-normal text-muted-foreground">/100</span></span>
        </div>
        <div className="w-full h-3 bg-muted/40 rounded-full overflow-hidden">
          <div className={`h-full rounded-full transition-all ${barColor}`} style={{ width: `${score}%` }} />
        </div>
        <p className={`text-xs mt-2 font-medium ${color}`}>{message}</p>
      </div>
    );
  } catch {
    return <div className="rounded-lg border p-4 text-sm text-muted-foreground">Risk score: N/A</div>;
  }
}

function StatusBadge({ status }: { status?: string }) {
  const { label, cls } = statusDisplay(status);
  return <Badge className={`text-xs ${cls}`}>{label}</Badge>;
}

function StarRating({ value, onChange }: { value: number; onChange: (n: number) => void }) {
  const [hover, setHover] = useState(0);
  return (
    <div className="flex items-center gap-1">
      {[1, 2, 3, 4, 5].map((s) => (
        <Star
          key={s}
          className={`h-7 w-7 cursor-pointer transition-colors ${s <= (hover || value) ? "fill-amber-400 text-amber-400" : "text-muted-foreground/30"}`}
          onMouseEnter={() => setHover(s)}
          onMouseLeave={() => setHover(0)}
          onClick={() => onChange(s)}
        />
      ))}
      <span className="text-sm text-muted-foreground ml-2">{value}/5</span>
    </div>
  );
}

const TAB_CLS = (active: boolean) =>
  `px-4 py-2 text-sm font-medium rounded-md transition-all ${active ? "bg-background shadow-sm text-foreground" : "text-muted-foreground hover:text-foreground"}`;

export default function DriverDetailDrawer({ driver, onClose, onRefetch }: Props) {
  const supabase = createClient();
  const [activeTab, setActiveTab] = useState("profile");
  const [acting, setActing] = useState(false);
  const [actError, setActError] = useState<string | null>(null);
  const [rentals, setRentals] = useState<any[]>([]);
  const [incidents, setIncidents] = useState<any[]>([]);
  const [dataLoading, setDataLoading] = useState(false);

  useEffect(() => {
    if (!driver) return;
    setActiveTab("profile");
    async function load() {
      setDataLoading(true);
      try {
        const [br, cr] = await Promise.all([
          supabase
            .from("bookings")
            .select("*, cars(brand,model,plate_number)")
            .eq("driver_id", driver!.id)
            .order("created_at", { ascending: false }),
          supabase
            .from("claims")
            .select("*, cars(brand,model,plate_number)")
            .eq("driver_id", driver!.id)
            .order("created_at", { ascending: false }),
        ]);
        setRentals(br.data || []);
        setIncidents(cr.data || []);
      } catch {
        // silently fail — tabs will show empty state
      } finally {
        setDataLoading(false);
      }
    }
    load();
  }, [driver?.id]);

  if (!driver) return null;

  const driverId = driver.id;
  const fmt = (d?: string | null) =>
    d ? new Date(d).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" }) : "—";

  const age = driver.date_of_birth ? calculateAge(driver.date_of_birth) : null;
  const today = new Date();
  const licExpired = driver.license_expiry && new Date(driver.license_expiry) < today;
  const licIn30 = driver.license_expiry && !licExpired && (() => {
    const in30 = new Date(); in30.setDate(today.getDate() + 30);
    return new Date(driver.license_expiry!) <= in30;
  })();

  const totalSpent = rentals.filter(r => r.status === "Completed")
    .reduce((s, r) => s + Number(r.total_amount || 0), 0);
  const onTimeCount = rentals.filter(r => r.status === "Completed" && r.end_date && new Date(r.end_date) >= new Date()).length;

  async function changeStatus(newStatus: string, reason?: string) {
    setActing(true); setActError(null);
    try {
      const update: any = { status: newStatus };
      if (newStatus === "blacklisted") {
        update.blacklisted = true;
        if (reason) { update.blacklist_reason = reason; update.blacklisted_at = new Date().toISOString(); }
      }
      if (newStatus === "active" || newStatus === "pending") {
        update.blacklisted = false;
        update.blacklist_reason = null;
      }
      const { error: e } = await supabase.from("drivers").update(update).eq("id", driverId);
      if (e) throw e;
      onRefetch();
      onClose();
    } catch (err: any) {
      setActError(err.message || "Failed to update status");
    } finally {
      setActing(false);
    }
  }

  async function updateRating(newRating: number) {
    try {
      await supabase.from("drivers").update({ rating: newRating }).eq("id", driverId);
      onRefetch();
    } catch {/* ignore */}
  }

  return (
    <Sheet open={!!driver} onOpenChange={(o) => !o && onClose()}>
      <SheetContent className="w-full sm:max-w-[580px] overflow-y-auto p-0" side="right">

        {/* ── HERO HEADER ── */}
        <div className="h-28 bg-gradient-to-br from-primary/20 to-muted flex items-center px-6 gap-4 border-b">
          <div className="h-16 w-16 rounded-full border-4 border-background overflow-hidden bg-muted shrink-0 flex items-center justify-center">
            {driver.photo_url
              ? <img src={driver.photo_url} alt={driver.full_name} className="w-full h-full object-cover" />
              : <span className="text-2xl font-bold text-primary">
                  {driver.full_name.split(" ").map(n => n[0]).join("").slice(0, 2).toUpperCase()}
                </span>
            }
          </div>
          <div className="flex-1 min-w-0">
            <SheetTitle className="text-xl truncate">{driver.full_name}</SheetTitle>
            <p className="text-sm text-muted-foreground">{driver.phone}</p>
            <div className="flex flex-wrap items-center gap-2 mt-1">
              {driver.driver_code && <Badge className="bg-primary text-primary-foreground border-none font-bold">{driver.driver_code}</Badge>}
              <StatusBadge status={driver.status} />
              {licExpired && <Badge variant="destructive" className="text-xs">License Expired</Badge>}
            </div>
          </div>
        </div>

        {/* ── TABS ── */}
        <div className="flex items-center gap-1 p-3 bg-muted/30 border-b overflow-x-auto">
          {["profile", "rentals", "incidents", "rating"].map(tab => (
            <button key={tab} onClick={() => setActiveTab(tab)} className={TAB_CLS(activeTab === tab)}>
              {tab.charAt(0).toUpperCase() + tab.slice(1)}
            </button>
          ))}
        </div>

        <div className="p-5 space-y-4">
          {actError && (
            <div className="bg-destructive/10 text-destructive text-sm p-3 rounded flex items-center gap-2">
              <AlertCircle className="h-4 w-4 shrink-0" />{actError}
            </div>
          )}

          {/* ══════════════════════════════
              TAB 1 — PROFILE
          ══════════════════════════════ */}
          {activeTab === "profile" && (
            <div className="space-y-5">
              {/* Status Banner */}
              {driver.blacklisted && (
                <div className="flex items-center gap-3 rounded-lg p-3 bg-gray-900 text-white">
                  <ShieldOff className="h-5 w-5 shrink-0" />
                  <span className="font-bold text-sm">BLACKLISTED — Never rent to this person</span>
                </div>
              )}

              {/* Risk Score */}
              <RiskMeter driver={driver} />

              {/* Action Buttons */}
              <div className="flex flex-wrap gap-2">
                {driver.status !== "active" && (
                  <Button size="sm" className="bg-emerald-600 hover:bg-emerald-700 text-white gap-1"
                    onClick={() => changeStatus("active")} disabled={acting}>
                    {acting ? <Loader2 className="h-3 w-3 animate-spin" /> : <CheckCircle2 className="h-3 w-3" />}
                    Approve
                  </Button>
                )}
                {driver.status !== "suspended" && (
                  <Button size="sm" variant="outline" className="gap-1 border-orange-400 text-orange-600"
                    onClick={() => changeStatus("suspended")} disabled={acting}>
                    <XCircle className="h-3 w-3" />Suspend
                  </Button>
                )}
                {driver.status !== "blacklisted" && (
                  <Button size="sm" variant="destructive" className="gap-1"
                    onClick={() => {
                      const reason = window.prompt("Enter blacklist reason:");
                      if (reason) changeStatus("blacklisted", reason);
                    }} disabled={acting}>
                    <ShieldOff className="h-3 w-3" />Blacklist
                  </Button>
                )}
                {driver.status === "blacklisted" && (
                  <Button size="sm" variant="outline" onClick={() => changeStatus("pending")} disabled={acting}>
                    Remove from Blacklist
                  </Button>
                )}
              </div>

              <Separator />

              {/* Section 1 — Personal */}
              <div>
                <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground mb-2">Personal Information</p>
                <InfoRow label="Full Name" value={driver.full_name} />
                <InfoRow label="Phone" value={driver.phone} />
                <InfoRow label="Nationality" value={driver.nationality} />
                <InfoRow label="Gender" value={driver.gender} />
                <InfoRow label="Address" value={driver.city ? `${driver.address || ""}, ${driver.city}` : driver.address} />
                <InfoRow label="Date of Birth"
                  value={driver.date_of_birth
                    ? `${fmt(driver.date_of_birth)}${age !== null ? ` (${age} years old)` : ""}`
                    : null}
                />
                <InfoRow label="Emergency Contact" value={driver.emergency_contact} />
              </div>

              <Separator />

              {/* Section 2 — Identity */}
              <div>
                <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground mb-2">Identity Document</p>
                <InfoRow label="ID Type" value={driver.id_type} />
                <InfoRow label="ID Number" value={driver.id_number} />
                <InfoRow label="ID Expiry" value={fmt(driver.id_expiry)} />
              </div>

              <Separator />

              {/* Section 3 — License */}
              <div>
                <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground mb-2">Driving License</p>
                <InfoRow label="License #" value={driver.license_number} />
                <InfoRow label="Type" value={driver.license_type ? `Class ${driver.license_type}` : null} />
                <InfoRow label="Issued" value={fmt(driver.license_issue_date)} />
                <InfoRow label="Issuing Country" value={driver.license_issuing_country} />
                <InfoRow label="Experience" value={driver.years_experience ? `${driver.years_experience} years` : null} />
                <div className="flex justify-between text-sm py-1.5 items-start">
                  <span className="text-muted-foreground">Expiry</span>
                  <div className="text-right">
                    <span className={`font-medium ${licExpired ? "text-red-600" : licIn30 ? "text-amber-600" : ""}`}>
                      {fmt(driver.license_expiry)}
                    </span>
                    {licExpired && (
                      <p className="text-xs text-red-600 font-semibold mt-0.5">⚠️ License expired on {fmt(driver.license_expiry)}</p>
                    )}
                    {licIn30 && (
                      <p className="text-xs text-amber-600 font-semibold mt-0.5">⚠️ Expiring within 30 days</p>
                    )}
                  </div>
                </div>
              </div>

              <Separator />

              {/* Section 4 — Risk Assessment */}
              <div>
                <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground mb-2">Risk Assessment</p>
                <InfoRow label="BG Check" value={driver.bg_check_status} />
                <InfoRow label="BG Check Date" value={fmt(driver.bg_check_date)} />
                <InfoRow label="Previous Accidents" value={driver.previous_accidents ? "Yes" : "No"} />
                {driver.accident_notes && <InfoRow label="Accident Notes" value={driver.accident_notes} />}
                {driver.blacklist_reason && <InfoRow label="Blacklist Reason" value={driver.blacklist_reason} />}
              </div>
            </div>
          )}

          {/* ══════════════════════════════
              TAB 2 — RENTALS
          ══════════════════════════════ */}
          {activeTab === "rentals" && (
            <div className="space-y-4">
              <div className="grid grid-cols-3 gap-2 text-center">
                <div className="rounded-lg border p-3"><p className="text-xs text-muted-foreground">Total</p><p className="text-xl font-bold">{rentals.length}</p></div>
                <div className="rounded-lg border p-3"><p className="text-xs text-muted-foreground">Spent</p><p className="text-xl font-bold">${totalSpent.toLocaleString()}</p></div>
                <div className="rounded-lg border p-3"><p className="text-xs text-muted-foreground">On Time</p>
                  <p className="text-xl font-bold">{rentals.length > 0 ? `${Math.round(onTimeCount / rentals.length * 100)}%` : "—"}</p>
                </div>
              </div>

              {dataLoading
                ? <div className="flex justify-center py-8"><Loader2 className="h-6 w-6 animate-spin text-muted-foreground" /></div>
                : rentals.length === 0
                  ? <p className="text-center py-8 text-muted-foreground text-sm">No rental history found.</p>
                  : (
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Car</TableHead>
                          <TableHead>Pickup</TableHead>
                          <TableHead>Return</TableHead>
                          <TableHead>Amount</TableHead>
                          <TableHead>Status</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {rentals.map((r: any) => (
                          <TableRow key={r.id}>
                            <TableCell className="text-sm">{r.cars ? `${r.cars.brand} ${r.cars.model}` : "—"}</TableCell>
                            <TableCell className="text-xs">{fmt(r.start_date)}</TableCell>
                            <TableCell className="text-xs">{fmt(r.end_date)}</TableCell>
                            <TableCell className="text-sm">${r.total_amount || 0}</TableCell>
                            <TableCell><Badge className="text-xs">{r.status}</Badge></TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  )
              }
            </div>
          )}

          {/* ══════════════════════════════
              TAB 3 — INCIDENTS
          ══════════════════════════════ */}
          {activeTab === "incidents" && (
            <div className="space-y-3">
              {dataLoading
                ? <div className="flex justify-center py-8"><Loader2 className="h-6 w-6 animate-spin text-muted-foreground" /></div>
                : incidents.length === 0
                  ? (
                    <div className="text-center py-12 border rounded-lg bg-emerald-50 dark:bg-emerald-950/20">
                      <Shield className="h-10 w-10 text-emerald-500 mx-auto mb-2" />
                      <p className="font-medium text-emerald-700 dark:text-emerald-400">No incidents recorded — Clean record ✅</p>
                    </div>
                  ) : (
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Date</TableHead>
                          <TableHead>Car</TableHead>
                          <TableHead>Type</TableHead>
                          <TableHead>Cost</TableHead>
                          <TableHead>Status</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {incidents.map((c: any) => (
                          <TableRow key={c.id}>
                            <TableCell className="text-xs">{fmt(c.incident_date || c.created_at)}</TableCell>
                            <TableCell className="text-sm">{c.cars ? `${c.cars.brand} ${c.cars.model}` : "—"}</TableCell>
                            <TableCell>{c.incident_type || c.claim_type || "—"}</TableCell>
                            <TableCell>${c.estimated_cost || c.amount || "—"}</TableCell>
                            <TableCell><Badge variant="destructive" className="text-xs">{c.status}</Badge></TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  )
              }
            </div>
          )}

          {/* ══════════════════════════════
              TAB 4 — RATING
          ══════════════════════════════ */}
          {activeTab === "rating" && (
            <div className="space-y-4">
              <div className="rounded-lg border p-6 text-center space-y-4">
                <p className="text-sm text-muted-foreground">Driver Rating</p>
                <StarRating value={driver.rating || 5} onChange={updateRating} />
                <p className="text-xs text-muted-foreground">Click stars to update. Changes save immediately.</p>
              </div>
              {driver.notes && (
                <div className="rounded-lg border p-4">
                  <p className="text-sm font-semibold mb-1">Staff Notes</p>
                  <p className="text-sm text-muted-foreground">{driver.notes}</p>
                </div>
              )}
              {driver.bg_check_notes && (
                <div className="rounded-lg border p-4">
                  <p className="text-sm font-semibold mb-1">Background Check Notes</p>
                  <p className="text-sm text-muted-foreground">{driver.bg_check_notes}</p>
                </div>
              )}
            </div>
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
}
