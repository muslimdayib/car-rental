"use client";

import { useCarProfile } from "@/lib/hooks/useCarProfile";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Car,
  Fuel,
  Wrench,
  CalendarDays,
  Shield,
  TrendingDown,
  DollarSign,
  AlertCircle,
  Loader2,
  MapPin,
  Gauge,
  Users,
  Hash,
} from "lucide-react";

interface CarDetailDrawerProps {
  carId: string | null;
  onClose: () => void;
}

export default function CarDetailDrawer({ carId, onClose }: CarDetailDrawerProps) {
  const {
    car,
    bookings,
    maintenance,
    fuelLogs,
    insurance,
    claims,
    totalRevenue,
    totalMaintenanceCost,
    totalFuelCost,
    netProfit,
    utilizationRate,
    loading,
    error,
  } = useCarProfile(carId);

  const currentYear = new Date().getFullYear();
  const carYear = Number(car?.year) || currentYear;
  const pPrice = Number(car?.purchase_price) || 0;
  const dRate = (Number(car?.depreciation_rate) || 0) / 100;
  const yearsOwned = Math.max(0, currentYear - carYear);
  const bookValueNow = Math.max(0, pPrice - pPrice * dRate * yearsOwned);
  const remainingPct = pPrice > 0 ? Math.round((bookValueNow / pPrice) * 100) : 0;

  // Generate year-by-year depreciation schedule
  const purchaseYear = car?.purchase_date
    ? new Date(car.purchase_date).getFullYear()
    : carYear;
  const scheduleEndYear = currentYear + 5;
  const depreciationSchedule = [];
  for (let y = purchaseYear; y <= scheduleEndYear; y++) {
    const yrs = Math.max(0, y - purchaseYear);
    const startVal = Math.max(0, pPrice - pPrice * dRate * Math.max(0, yrs - 1));
    const endVal = Math.max(0, pPrice - pPrice * dRate * yrs);
    const depAmount = Math.max(0, startVal - endVal);
    depreciationSchedule.push({
      year: y,
      startValue: yrs === 0 ? pPrice : startVal,
      depreciation: depAmount,
      endValue: endVal,
      pct: pPrice > 0 ? Math.round((endVal / pPrice) * 100) : 0,
      isCurrent: y === currentYear,
      isSaleRecommended: pPrice > 0 && endVal / pPrice < 0.3,
    });
  }

  const statusColor = (s: string) => {
    switch (s?.toLowerCase()) {
      case "available": return "bg-emerald-500 text-white";
      case "rented": return "bg-blue-500 text-white";
      case "maintenance": return "bg-amber-500 text-white";
      case "sold": return "bg-gray-500 text-white";
      case "damaged": return "bg-red-500 text-white";
      default: return "";
    }
  };

  return (
    <Sheet open={!!carId} onOpenChange={onClose}>
      <SheetContent className="w-full sm:max-w-3xl overflow-y-auto p-0" side="right">
        {loading && (
          <div className="flex items-center justify-center h-full">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          </div>
        )}
        {error && (
          <div className="p-6 text-destructive flex items-center gap-2">
            <AlertCircle className="h-5 w-5" />
            {error}
          </div>
        )}
        {!loading && !error && car && (
          <>
            {/* Hero */}
            <div className="relative h-48 bg-muted overflow-hidden">
              {car.image_url ? (
                <img src={car.image_url} alt={car.name} className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-primary/10 to-muted">
                  <Car className="h-24 w-24 text-primary/20" />
                </div>
              )}
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
              <div className="absolute bottom-0 left-0 p-4 text-white">
                <h2 className="text-2xl font-bold">{car.name}</h2>
                <div className="flex flex-wrap items-center gap-2 mt-1">
                  {car.fleet_number && <Badge className="bg-primary text-primary-foreground border-none font-bold">{car.fleet_number}</Badge>}
                  {car.car_code && <Badge variant="outline" className="text-white border-white/40">{car.car_code}</Badge>}
                  <Badge className="font-mono bg-white/20 text-white border-white/30">{car.plate_number}</Badge>
                  <Badge className={statusColor(car.status)}>{car.status}</Badge>
                </div>
              </div>
            </div>

            <Tabs defaultValue="overview" className="p-4">
              <TabsList className="grid w-full grid-cols-6 mb-4 h-auto">
                <TabsTrigger value="overview" className="text-xs py-1.5">Overview</TabsTrigger>
                <TabsTrigger value="bookings" className="text-xs py-1.5">Bookings</TabsTrigger>
                <TabsTrigger value="maintenance" className="text-xs py-1.5">Maintenance</TabsTrigger>
                <TabsTrigger value="fuel" className="text-xs py-1.5">Fuel</TabsTrigger>
                <TabsTrigger value="insurance" className="text-xs py-1.5">Insurance</TabsTrigger>
                <TabsTrigger value="depreciation" className="text-xs py-1.5">Depreciation</TabsTrigger>
              </TabsList>

              {/* ── OVERVIEW ── */}
              <TabsContent value="overview" className="space-y-4">
                {/* KPIs */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  <KpiCard icon={<DollarSign className="h-4 w-4 text-emerald-500" />} label="Total Revenue" value={`$${totalRevenue.toLocaleString()}`} />
                  <KpiCard icon={<Wrench className="h-4 w-4 text-amber-500" />} label="Maintenance Cost" value={`$${totalMaintenanceCost.toLocaleString()}`} />
                  <KpiCard icon={<Fuel className="h-4 w-4 text-blue-500" />} label="Fuel Cost" value={`$${totalFuelCost.toLocaleString()}`} />
                  <KpiCard icon={<TrendingDown className={`h-4 w-4 ${netProfit >= 0 ? "text-emerald-500" : "text-red-500"}`} />} label="Net Profit" value={`${netProfit >= 0 ? "+" : ""}$${netProfit.toLocaleString()}`} highlight={netProfit < 0} />
                </div>

                {/* Book Value Progress */}
                {pPrice > 0 && (
                  <Card>
                    <CardContent className="pt-4 space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Current Book Value</span>
                        <span className="font-bold text-primary">${Math.round(bookValueNow).toLocaleString()}</span>
                      </div>
                      <div className="w-full h-3 bg-muted rounded-full overflow-hidden">
                        <div
                          className={`h-full rounded-full transition-all ${remainingPct > 60 ? "bg-emerald-500" : remainingPct > 30 ? "bg-amber-500" : "bg-red-500"}`}
                          style={{ width: `${remainingPct}%` }}
                        />
                      </div>
                      <div className="flex justify-between text-xs text-muted-foreground">
                        <span>Purchased for ${pPrice.toLocaleString()}</span>
                        <span>{remainingPct}% remaining</span>
                      </div>
                    </CardContent>
                  </Card>
                )}

                {/* Utilization */}
                <div className="flex items-center justify-between p-3 rounded-lg bg-muted/30 border">
                  <div className="flex items-center gap-2">
                    <Gauge className="h-4 w-4 text-primary" />
                    <span className="text-sm font-medium">Fleet Utilization Rate</span>
                  </div>
                  <span className="font-bold text-lg">{utilizationRate}%</span>
                </div>

                {/* Car Specs */}
                <Card>
                  <CardHeader className="pb-2"><CardTitle className="text-sm">Vehicle Specifications</CardTitle></CardHeader>
                  <CardContent className="grid grid-cols-2 gap-x-4 gap-y-2 text-sm">
                    <SpecRow label="Fleet Number" value={car.fleet_number} mono />
                    <SpecRow label="Car ID" value={car.car_code} mono />
                    <SpecRow label="Brand" value={car.brand} />
                    <SpecRow label="Model" value={car.model} />
                    <SpecRow label="Year" value={String(car.year)} />
                    <SpecRow label="Color" value={car.color} />
                    <SpecRow label="Body Type" value={car.body_type} />
                    <SpecRow label="Fuel" value={car.fuel_type} />
                    <SpecRow label="Engine" value={car.engine_size} />
                    <SpecRow label="Transmission" value={car.transmission} />
                    <SpecRow label="Drive" value={car.drive_type} />
                    <SpecRow label="Seats" value={car.seats ? String(car.seats) : null} />
                    <SpecRow label="Mileage" value={car.mileage ? `${Number(car.mileage).toLocaleString()} km` : null} />
                    <SpecRow label="Condition" value={car.condition} />
                    <SpecRow label="GPS ID" value={car.gps_tracker_id} />
                    <SpecRow label="Chassis/VIN" value={car.chassis_number} mono />
                    <SpecRow label="Reg. Expiry" value={car.registration_expiry ? new Date(car.registration_expiry).toLocaleDateString() : null} />
                    <SpecRow label="Road Tax Exp." value={car.road_tax_expiry ? new Date(car.road_tax_expiry).toLocaleDateString() : null} />
                    <SpecRow label="Prev. Owners" value={car.previous_owners != null ? String(car.previous_owners) : null} />
                    <SpecRow label="Accident History" value={car.accident_history ? "Yes" : "No"} />
                  </CardContent>
                </Card>
              </TabsContent>

              {/* ── BOOKINGS ── */}
              <TabsContent value="bookings" className="space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="font-semibold">{bookings.length} Bookings</h3>
                  <span className="text-sm text-muted-foreground">Total: ${totalRevenue.toLocaleString()}</span>
                </div>
                {bookings.length === 0 ? (
                  <EmptyState message="No bookings found for this vehicle." />
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Customer</TableHead>
                        <TableHead>Start</TableHead>
                        <TableHead>End</TableHead>
                        <TableHead>Amount</TableHead>
                        <TableHead>Status</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {bookings.map((b: any) => (
                        <TableRow key={b.id}>
                          <TableCell className="font-medium">{b.customers?.full_name || "—"}</TableCell>
                          <TableCell className="text-sm">{b.start_date ? new Date(b.start_date).toLocaleDateString() : "—"}</TableCell>
                          <TableCell className="text-sm">{b.end_date ? new Date(b.end_date).toLocaleDateString() : "—"}</TableCell>
                          <TableCell>${b.total_amount}</TableCell>
                          <TableCell><StatusBadge status={b.status} /></TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                )}
              </TabsContent>

              {/* ── MAINTENANCE ── */}
              <TabsContent value="maintenance" className="space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="font-semibold">{maintenance.length} Records</h3>
                  <span className="text-sm text-muted-foreground">Total Cost: ${totalMaintenanceCost.toLocaleString()}</span>
                </div>
                {maintenance.length === 0 ? (
                  <EmptyState message="No maintenance records for this vehicle." />
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Issue</TableHead>
                        <TableHead>Mechanic</TableHead>
                        <TableHead>Cost</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Date</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {maintenance.map((m: any) => (
                        <TableRow key={m.id}>
                          <TableCell className="font-medium">{m.issue}</TableCell>
                          <TableCell>{m.employees?.full_name || "—"}</TableCell>
                          <TableCell>${m.cost || "—"}</TableCell>
                          <TableCell><StatusBadge status={m.status} /></TableCell>
                          <TableCell className="text-sm">{m.start_date ? new Date(m.start_date).toLocaleDateString() : "—"}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                )}
              </TabsContent>

              {/* ── FUEL ── */}
              <TabsContent value="fuel" className="space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="font-semibold">{fuelLogs.length} Fuel Logs</h3>
                  <span className="text-sm text-muted-foreground">Total: ${totalFuelCost.toLocaleString()}</span>
                </div>
                {fuelLogs.length === 0 ? (
                  <EmptyState message="No fuel logs for this vehicle." />
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Date</TableHead>
                        <TableHead>Driver</TableHead>
                        <TableHead>Liters</TableHead>
                        <TableHead>Cost</TableHead>
                        <TableHead>Odometer</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {fuelLogs.map((f: any) => (
                        <TableRow key={f.id}>
                          <TableCell>{f.date ? new Date(f.date).toLocaleDateString() : "—"}</TableCell>
                          <TableCell>{f.drivers?.full_name || "—"}</TableCell>
                          <TableCell>{f.liters}L</TableCell>
                          <TableCell>${f.total_cost}</TableCell>
                          <TableCell>{f.odometer ? `${Number(f.odometer).toLocaleString()} km` : "—"}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                )}
              </TabsContent>

              {/* ── INSURANCE ── */}
              <TabsContent value="insurance" className="space-y-4">
                <h3 className="font-semibold">Insurance Policies</h3>
                {insurance.length === 0 ? (
                  <EmptyState message="No insurance policies linked to this vehicle." />
                ) : (
                  insurance.map((p: any) => (
                    <Card key={p.id}>
                      <CardContent className="pt-4 grid grid-cols-2 gap-2 text-sm">
                        <SpecRow label="Provider" value={p.provider} />
                        <SpecRow label="Policy #" value={p.policy_number} mono />
                        <SpecRow label="Type" value={p.type} />
                        <SpecRow label="Premium" value={p.premium ? `$${p.premium}` : null} />
                        <SpecRow label="Start" value={p.start_date ? new Date(p.start_date).toLocaleDateString() : null} />
                        <SpecRow label="Expiry" value={p.end_date ? new Date(p.end_date).toLocaleDateString() : null} />
                        <div className="col-span-2"><StatusBadge status={p.status} /></div>
                      </CardContent>
                    </Card>
                  ))
                )}

                {claims.length > 0 && (
                  <>
                    <h3 className="font-semibold mt-4">Claims History</h3>
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Date</TableHead>
                          <TableHead>Type</TableHead>
                          <TableHead>Est. Cost</TableHead>
                          <TableHead>Status</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {claims.map((c: any) => (
                          <TableRow key={c.id}>
                            <TableCell>{c.incident_date ? new Date(c.incident_date).toLocaleDateString() : "—"}</TableCell>
                            <TableCell>{c.incident_type}</TableCell>
                            <TableCell>${c.estimated_cost || "—"}</TableCell>
                            <TableCell><StatusBadge status={c.status} /></TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </>
                )}
              </TabsContent>

              {/* ── DEPRECIATION SCHEDULE ── */}
              <TabsContent value="depreciation" className="space-y-3">
                <h3 className="font-semibold">Year-by-Year Depreciation Schedule</h3>
                {pPrice === 0 ? (
                  <EmptyState message="No purchase price set. Add a purchase price to calculate depreciation." />
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Year</TableHead>
                        <TableHead>Start Value</TableHead>
                        <TableHead>Depreciation</TableHead>
                        <TableHead>End Value</TableHead>
                        <TableHead>% Remaining</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {depreciationSchedule.map((row) => (
                        <TableRow key={row.year} className={row.isCurrent ? "bg-primary/10 font-semibold" : ""}>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              {row.year}
                              {row.isCurrent && <Badge className="text-xs bg-primary text-white">Current</Badge>}
                              {row.isSaleRecommended && <Badge variant="destructive" className="text-xs">Sell</Badge>}
                            </div>
                          </TableCell>
                          <TableCell>${Math.round(row.startValue).toLocaleString()}</TableCell>
                          <TableCell className="text-red-500">-${Math.round(row.depreciation).toLocaleString()}</TableCell>
                          <TableCell>${Math.round(row.endValue).toLocaleString()}</TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <div className="w-16 h-1.5 bg-muted rounded-full overflow-hidden">
                                <div
                                  className={`h-full rounded-full ${row.pct > 60 ? "bg-emerald-500" : row.pct > 30 ? "bg-amber-500" : "bg-red-500"}`}
                                  style={{ width: `${row.pct}%` }}
                                />
                              </div>
                              <span className="text-xs">{row.pct}%</span>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                )}
              </TabsContent>
            </Tabs>
          </>
        )}
      </SheetContent>
    </Sheet>
  );
}

function KpiCard({ icon, label, value, highlight }: { icon: React.ReactNode; label: string; value: string; highlight?: boolean }) {
  return (
    <div className="rounded-lg border bg-card p-3 space-y-1">
      <div className="flex items-center gap-1.5 text-xs text-muted-foreground">{icon}{label}</div>
      <p className={`font-bold text-base ${highlight ? "text-destructive" : ""}`}>{value}</p>
    </div>
  );
}

function SpecRow({ label, value, mono }: { label: string; value: string | null | undefined; mono?: boolean }) {
  if (!value) return null;
  return (
    <div>
      <p className="text-xs text-muted-foreground">{label}</p>
      <p className={`font-medium text-sm ${mono ? "font-mono" : ""}`}>{value}</p>
    </div>
  );
}

function StatusBadge({ status }: { status: string }) {
  const map: Record<string, string> = {
    Available: "bg-emerald-500 text-white",
    Active: "bg-emerald-500 text-white",
    Rented: "bg-blue-500 text-white",
    Completed: "bg-gray-500 text-white",
    Reserved: "bg-indigo-500 text-white",
    Maintenance: "bg-amber-500 text-white",
    Cancelled: "bg-red-400 text-white",
    Open: "bg-orange-500 text-white",
  };
  return <Badge className={map[status] || ""}>{status}</Badge>;
}

function EmptyState({ message }: { message: string }) {
  return (
    <div className="py-10 text-center text-muted-foreground text-sm border rounded-lg bg-muted/10">
      {message}
    </div>
  );
}
