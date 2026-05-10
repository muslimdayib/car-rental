"use client";

import { useState, useMemo } from "react";
import { useDrivers, Driver, riskLabel, statusDisplay, calculateAge } from "@/lib/hooks/useDrivers";
import { createClient } from "@/lib/supabase/client";
import DriverFormModal from "@/components/drivers/DriverFormModal";
import DriverDetailDrawer from "@/components/drivers/DriverDetailDrawer";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  Plus, Search, Star, Eye, Edit2, Trash2,
  AlertTriangle, AlertCircle, Loader2, ShieldOff, Clock, Users,
} from "lucide-react";

const TABS = ["Profiles", "Monitoring", "Blacklist"];

function Stars({ value }: { value: number }) {
  return (
    <div className="flex">
      {[1,2,3,4,5].map(i => (
        <Star key={i} className={`h-3.5 w-3.5 ${i <= (value || 5) ? "fill-amber-400 text-amber-400" : "text-muted-foreground/25"}`} />
      ))}
    </div>
  );
}

function RiskBadge({ score }: { score: number }) {
  try {
    const { color, bg } = riskLabel(score);
    const bgCls = score >= 80 ? "bg-emerald-50 border-emerald-200 text-emerald-700" :
      score >= 60 ? "bg-amber-50 border-amber-200 text-amber-700" :
      score >= 40 ? "bg-orange-50 border-orange-200 text-orange-700" :
      "bg-red-50 border-red-200 text-red-700";
    return <span className={`text-xs px-2 py-0.5 rounded-full border font-semibold ${bgCls}`}>{score}</span>;
  } catch {
    return <span className="text-xs text-muted-foreground">N/A</span>;
  }
}

// BUG 2 FIX — uses statusDisplay() which reads lowercase `status` values from DB
function StatusBadge({ status }: { status?: string }) {
  const { label, cls } = statusDisplay(status);
  return <Badge className={`text-xs ${cls}`}>{label}</Badge>;
}

const fmt = (d?: string | null) =>
  d ? new Date(d).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" }) : "—";
const initials = (name: string) =>
  name.split(" ").map(n => n[0]).join("").slice(0, 2).toUpperCase();

export default function DriversPage() {
  const { data: drivers, loading, error, refetch } = useDrivers();
  const supabase = createClient();

  const [activeTab, setActiveTab] = useState("Profiles");
  const [search, setSearch] = useState("");
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editing, setEditing] = useState<Driver | null>(null);
  const [viewing, setViewing] = useState<Driver | null>(null);
  const [deleting, setDeleting] = useState<Driver | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);

  // Monitoring tab state
  const [activeRentals, setActiveRentals] = useState<any[]>([]);
  const [rentalsLoading, setRentalsLoading] = useState(false);
  const [rentalsError, setRentalsError] = useState<string | null>(null);

  const blacklisted = useMemo(() => drivers.filter(d => d.blacklisted || d.status === "blacklisted"), [drivers]);
  const expiredLicense = useMemo(() => drivers.filter(d => d.license_expired && d.status !== "blacklisted"), [drivers]);

  const filtered = useMemo(() => {
    const q = search.toLowerCase();
    return drivers.filter(d =>
      d.full_name.toLowerCase().includes(q) ||
      d.phone.includes(q) ||
      (d.license_number || "").toLowerCase().includes(q)
    );
  }, [drivers, search]);

  const handleDelete = async () => {
    if (!deleting) return;
    setIsDeleting(true); setDeleteError(null);
    try {
      const { error: e } = await supabase.from("drivers").delete().eq("id", deleting.id);
      if (e) throw e;
      setDeleting(null); refetch();
    } catch (err: any) { setDeleteError(err.message); }
    finally { setIsDeleting(false); }
  };

  // FIX 1 — show ALL active bookings (no driver_id filter)
  // FIX 3 — also fetch stats: available cars count
  const [monitoringStats, setMonitoringStats] = useState({ total: 0, overdue: 0, dueToday: 0, available: 0 });

  const loadMonitoring = async () => {
    setRentalsLoading(true); setRentalsError(null);
    try {
      // FIX 1: No .not('driver_id') filter — ALL active bookings
      const { data, error: e } = await supabase
        .from("bookings")
        .select(`
          *,
          cars (id, brand, model, plate_number, color),
          customers (id, full_name, phone),
          drivers (id, full_name, phone, rating, status)
        `)
        .eq("status", "Active")
        .order("created_at", { ascending: false });
      if (e) throw e;

      // FIX 3: Available cars count
      const { count: availCount } = await supabase
        .from("cars").select("id", { count: "exact", head: true }).eq("status", "Available");

      const today = new Date();
      const todayStr = today.toISOString().split("T")[0];

      const processed = (data || []).map(r => {
        const returnDate = r.end_date ? new Date(r.end_date) : null;
        const isOverdue = returnDate ? returnDate < today : false;
        const dueToday = r.end_date === todayStr;
        const daysOverdue = isOverdue && returnDate
          ? Math.ceil((today.getTime() - returnDate.getTime()) / 86400000)
          : 0;
        const daysLeft = !isOverdue && returnDate
          ? Math.ceil((returnDate.getTime() - today.getTime()) / 86400000)
          : 0;
        // FIX 1: fall back to customer when no driver linked
        const personName = r.drivers?.full_name
          ? r.drivers.full_name
          : r.customers?.full_name ? `${r.customers.full_name} (Customer)` : "Unknown";
        const personPhone = r.drivers?.phone || r.customers?.phone || "";
        return { ...r, isOverdue, dueToday, daysOverdue, daysLeft, personName, personPhone };
      });

      processed.sort((a, b) => (b.isOverdue ? 1 : 0) - (a.isOverdue ? 1 : 0));
      setActiveRentals(processed);

      // FIX 3 stats
      setMonitoringStats({
        total: processed.length,
        overdue: processed.filter(r => r.isOverdue).length,
        dueToday: processed.filter(r => r.dueToday && !r.isOverdue).length,
        available: availCount || 0,
      });
    } catch (err: any) {
      setRentalsError(err.message || "Failed to load monitoring data");
    } finally { setRentalsLoading(false); }
  };

  return (
    <div className="flex-1 space-y-6 pb-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Driver Profiles</h2>
          <p className="text-muted-foreground mt-1">People who rent and drive your cars</p>
        </div>
        {activeTab === "Profiles" && (
          <Button className="gap-2 shrink-0" onClick={() => { setEditing(null); setIsFormOpen(true); }}>
            <Plus className="h-4 w-4" />Register Driver
          </Button>
        )}
      </div>

      {/* Global Alerts */}
      {expiredLicense.length > 0 && (
        <div className="bg-red-50 border border-red-200 text-red-700 p-3 rounded-lg flex items-center gap-2 text-sm">
          <AlertTriangle className="h-4 w-4 shrink-0" />
          <span><strong>{expiredLicense.length}</strong> driver{expiredLicense.length > 1 ? "s have" : " has"} an expired license: {expiredLicense.map(d => d.full_name).join(", ")}</span>
        </div>
      )}

      {/* Tabs */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center p-1 bg-muted rounded-lg overflow-x-auto gap-0.5">
          {TABS.map(tab => (
            <button key={tab}
              onClick={() => { setActiveTab(tab); if (tab === "Monitoring") loadMonitoring(); }}
              className={`px-4 py-1.5 text-sm font-medium rounded-md transition-all whitespace-nowrap ${activeTab === tab ? "bg-background shadow-sm" : "text-muted-foreground hover:text-foreground"}`}>
              {tab}
              {tab === "Blacklist" && blacklisted.length > 0 && (
                <span className="ml-1.5 bg-red-500 text-white text-xs rounded-full px-1.5 py-0.5">{blacklisted.length}</span>
              )}
            </button>
          ))}
        </div>
        {activeTab === "Profiles" && (
          <div className="relative w-full sm:w-[280px]">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input placeholder="Search name, phone, license…" className="pl-8 bg-background" value={search} onChange={e => setSearch(e.target.value)} />
          </div>
        )}
      </div>

      {error && (
        <div className="bg-destructive/10 text-destructive p-3 rounded-lg flex items-center gap-2 text-sm">
          <AlertCircle className="h-4 w-4" />{error}
        </div>
      )}

      {/* ════════════════════════
          TAB — PROFILES
      ════════════════════════ */}
      {activeTab === "Profiles" && (
        <Card>
          <CardContent className="p-0 overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Driver</TableHead>
                  <TableHead>Phone</TableHead>
                  <TableHead>License Expiry</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Risk Score</TableHead>
                  <TableHead>Rating</TableHead>
                  <TableHead>Rentals</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  Array.from({ length: 5 }).map((_, i) => (
                    <TableRow key={i} className="animate-pulse">
                      {Array.from({ length: 8 }).map((_, j) => (
                        <TableCell key={j}><div className="h-4 bg-muted rounded" /></TableCell>
                      ))}
                    </TableRow>
                  ))
                ) : filtered.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={8} className="h-32 text-center">
                      <div className="flex flex-col items-center gap-2 text-muted-foreground">
                        <Users className="h-10 w-10 opacity-20" />
                        {drivers.length === 0 ? "No driver profiles registered yet." : "No drivers match your search."}
                      </div>
                    </TableCell>
                  </TableRow>
                ) : (
                  filtered.map(driver => (
                    <TableRow key={driver.id} className="group hover:bg-muted/40">
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Avatar className="h-8 w-8">
                            {driver.photo_url && <AvatarImage src={driver.photo_url} />}
                            <AvatarFallback className="bg-primary/10 text-primary text-xs">{initials(driver.full_name)}</AvatarFallback>
                          </Avatar>
                          <div>
                            <p className="font-medium">
                              {driver.driver_code && <Badge className="mr-1.5 bg-primary text-primary-foreground border-none px-1.5 py-0">{driver.driver_code}</Badge>}
                              {driver.full_name}
                            </p>
                            {/* BUG 1 FIX — shows correct age */}
                            {driver.age !== undefined && (
                              <p className="text-xs text-muted-foreground">{driver.age} years old</p>
                            )}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="text-sm">{driver.phone}</TableCell>
                      <TableCell>
                        {driver.license_expiry ? (
                          <span className={`text-sm font-medium ${driver.license_expired ? "text-red-500" : driver.license_expiring_soon ? "text-amber-500" : ""}`}>
                            {fmt(driver.license_expiry)}
                            {driver.license_expired && <span className="text-xs ml-1">(EXPIRED)</span>}
                          </span>
                        ) : <span className="text-muted-foreground text-sm">—</span>}
                      </TableCell>
                      {/* BUG 2 FIX — StatusBadge reads `status` column via statusDisplay() */}
                      <TableCell><StatusBadge status={driver.status} /></TableCell>
                      {/* BUG 3 FIX — wrapped in try/catch via RiskBadge */}
                      <TableCell><RiskBadge score={driver.computed_risk_score} /></TableCell>
                      <TableCell><Stars value={driver.rating || 5} /></TableCell>
                      <TableCell className="text-center">{driver.total_rentals}</TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                          <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => setViewing(driver)}>
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => { setEditing(driver); setIsFormOpen(true); }}>
                            <Edit2 className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive hover:text-destructive hover:bg-destructive/10"
                            onClick={() => { setDeleteError(null); setDeleting(driver); }}>
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}

      {/* ════════════════════════
          TAB — MONITORING (ALL FIXES)
      ════════════════════════ */}
      {activeTab === "Monitoring" && (
        <div className="space-y-6">
          {/* FIX 3 — Summary stat cards */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="rounded-xl border bg-card p-4 text-center">
              <p className="text-2xl font-black">{monitoringStats.total}</p>
              <p className="text-xs text-muted-foreground mt-1">Currently Out</p>
            </div>
            <div className={`rounded-xl border p-4 text-center ${monitoringStats.overdue > 0 ? "bg-red-50 border-red-300" : "bg-card"}`}>
              <p className={`text-2xl font-black ${monitoringStats.overdue > 0 ? "text-red-600" : ""}`}>{monitoringStats.overdue}</p>
              <p className="text-xs text-muted-foreground mt-1">Overdue Returns</p>
            </div>
            <div className={`rounded-xl border p-4 text-center ${monitoringStats.dueToday > 0 ? "bg-amber-50 border-amber-300" : "bg-card"}`}>
              <p className={`text-2xl font-black ${monitoringStats.dueToday > 0 ? "text-amber-600" : ""}`}>{monitoringStats.dueToday}</p>
              <p className="text-xs text-muted-foreground mt-1">Due Today</p>
            </div>
            <div className="rounded-xl border bg-emerald-50 border-emerald-200 p-4 text-center">
              <p className="text-2xl font-black text-emerald-600">{monitoringStats.available}</p>
              <p className="text-xs text-muted-foreground mt-1">Available Cars</p>
            </div>
          </div>

          {rentalsLoading ? (
            <div className="flex justify-center py-12"><Loader2 className="h-8 w-8 animate-spin text-muted-foreground" /></div>
          ) : rentalsError ? (
            <div className="bg-destructive/10 text-destructive p-3 rounded-lg flex items-center gap-2 text-sm">
              <AlertCircle className="h-4 w-4" />{rentalsError}
            </div>
          ) : activeRentals.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 border rounded-xl bg-muted/10 text-muted-foreground">
              <Clock className="h-12 w-12 opacity-20 mb-3" />
              <p className="font-medium">No active rentals right now</p>
              <p className="text-sm mt-1">When customers book cars they will appear here</p>
            </div>
          ) : (
            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
              {activeRentals.map(rental => (
                <div key={rental.id} className={`rounded-xl border p-4 space-y-3 ${
                  rental.isOverdue ? "bg-red-50 dark:bg-red-950/20 border-red-300" : "bg-card border-blue-100"
                }`}>
                  {/* Overdue banner */}
                  {rental.isOverdue && (
                    <div className="flex items-center gap-2 bg-red-100 dark:bg-red-900/40 rounded-lg px-3 py-2 text-red-700 text-sm font-bold">
                      <AlertTriangle className="h-4 w-4 shrink-0" />
                      🚨 OVERDUE — {rental.daysOverdue}d late
                    </div>
                  )}
                  {!rental.isOverdue && (
                    <div className="flex items-center gap-1.5 text-blue-600 text-xs font-semibold">
                      <span className="h-2 w-2 rounded-full bg-blue-500 animate-pulse" />
                      ✅ On Trip
                    </div>
                  )}

                  {/* FIX 1 — Shows customer name when no driver profile linked */}
                  <div>
                    <p className="font-semibold">{rental.personName}</p>
                    <p className="text-sm text-muted-foreground">{rental.personPhone}</p>
                  </div>

                  <div className="text-sm space-y-1.5">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Car</span>
                      <span className="font-medium">{rental.cars ? `${rental.cars.brand} ${rental.cars.model}` : "—"}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Plate</span>
                      <span className="font-mono text-xs">{rental.cars?.plate_number || "—"}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Pickup</span>
                      <span>{fmt(rental.start_date)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Return due</span>
                      <span className={`font-semibold text-sm ${
                        rental.isOverdue ? "text-red-600" : rental.daysLeft <= 1 ? "text-amber-500" : ""
                      }`}>
                        {rental.isOverdue
                          ? `${rental.daysOverdue}d overdue`
                          : `${fmt(rental.end_date)} (${rental.daysLeft}d left)`
                        }
                      </span>
                    </div>
                  </div>

                  {rental.isOverdue && (
                    <div className="bg-red-100 dark:bg-red-900/30 rounded-lg p-2 text-xs text-red-700 font-semibold">
                      📞 Call immediately: {rental.personPhone || "No phone on record"}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}

          {/* FIX 5 — All Drivers Overview */}
          {!rentalsLoading && drivers.length > 0 && (
            <div>
              <h3 className="text-base font-semibold mb-3">All Registered Drivers</h3>
              <Card>
                <CardContent className="p-0 overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Driver</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Current Trip</TableHead>
                        <TableHead>Risk</TableHead>
                        <TableHead>Rating</TableHead>
                        <TableHead className="text-right">Trips</TableHead>
                        <TableHead></TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {drivers.map(driver => {
                        const activeRental = activeRentals.find(r => r.driver_id === driver.id);
                        return (
                          <TableRow key={driver.id}>
                            <TableCell>
                              <div className="flex items-center gap-2">
                                <Avatar className="h-7 w-7">
                                  {driver.photo_url && <AvatarImage src={driver.photo_url} />}
                                  <AvatarFallback className="text-xs">{initials(driver.full_name)}</AvatarFallback>
                                </Avatar>
                                <div>
                                  <p className="text-sm font-medium">
                                    {driver.driver_code && <Badge className="mr-1.5 bg-primary text-primary-foreground border-none px-1.5 py-0">{driver.driver_code}</Badge>}
                                    {driver.full_name}
                                  </p>
                                  <p className="text-xs text-muted-foreground">{driver.phone}</p>
                                </div>
                              </div>
                            </TableCell>
                            <TableCell><StatusBadge status={driver.status} /></TableCell>
                            <TableCell className="text-sm">
                              {activeRental
                                ? <span className="text-blue-600 font-medium">{activeRental.cars?.brand} {activeRental.cars?.model}</span>
                                : <span className="text-muted-foreground">Not on trip</span>
                              }
                            </TableCell>
                            <TableCell><RiskBadge score={driver.computed_risk_score} /></TableCell>
                            <TableCell><Stars value={driver.rating || 5} /></TableCell>
                            <TableCell className="text-right">{driver.total_rentals}</TableCell>
                            <TableCell>
                              <Button variant="ghost" size="sm" className="h-7 text-xs" onClick={() => setViewing(driver)}>View</Button>
                            </TableCell>
                          </TableRow>
                        );
                      })}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            </div>
          )}
        </div>
      )}

      {/* ════════════════════════
          TAB — BLACKLIST
      ════════════════════════ */}
      {activeTab === "Blacklist" && (
        <div className="space-y-4">
          {blacklisted.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 border rounded-xl bg-muted/10 text-muted-foreground">
              <ShieldOff className="h-12 w-12 opacity-20 mb-3" />
              <p className="font-medium">No blacklisted drivers</p>
            </div>
          ) : (
            <div className="grid gap-4 sm:grid-cols-2">
              {blacklisted.map(driver => (
                <div key={driver.id} className="rounded-xl border border-red-200 bg-red-50 dark:bg-red-950/20 p-4 space-y-3">
                  <div className="flex items-center gap-3">
                    <Avatar className="h-12 w-12">
                      {driver.photo_url && <AvatarImage src={driver.photo_url} />}
                      <AvatarFallback className="bg-red-100 text-red-600 text-sm">{initials(driver.full_name)}</AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="font-bold text-red-700">{driver.full_name}</p>
                      <p className="text-sm text-muted-foreground">{driver.phone}</p>
                    </div>
                    <ShieldOff className="h-5 w-5 text-red-500 ml-auto shrink-0" />
                  </div>
                  {driver.blacklist_reason && (
                    <div className="text-sm bg-white dark:bg-red-950/40 rounded p-2 border border-red-200">
                      <span className="font-medium text-red-600">Reason: </span>{driver.blacklist_reason}
                    </div>
                  )}
                  {driver.blacklisted_at && (
                    <p className="text-xs text-muted-foreground">Blacklisted on {fmt(driver.blacklisted_at)}</p>
                  )}
                  <Button size="sm" variant="outline" className="w-full border-red-300" onClick={() => setViewing(driver)}>
                    View Full Profile
                  </Button>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Modals */}
      {isFormOpen && (
        <DriverFormModal
          open={isFormOpen}
          onClose={() => setIsFormOpen(false)}
          onSaved={() => { setIsFormOpen(false); refetch(); }}
          initialData={editing}
        />
      )}

      <DriverDetailDrawer driver={viewing} onClose={() => setViewing(null)} onRefetch={refetch} />

      <AlertDialog open={!!deleting} onOpenChange={o => !o && setDeleting(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Driver Profile</AlertDialogTitle>
            <AlertDialogDescription>
              Delete <strong>{deleting?.full_name}</strong>? This cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          {deleteError && (
            <div className="bg-destructive/10 text-destructive text-sm p-3 rounded flex items-center gap-2">
              <AlertCircle className="h-4 w-4" />{deleteError}
            </div>
          )}
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} disabled={isDeleting}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              {isDeleting && <Loader2 className="h-4 w-4 animate-spin mr-2" />}Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
