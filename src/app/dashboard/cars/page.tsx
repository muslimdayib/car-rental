"use client";

import { useState, useMemo } from "react";
import { useCars } from "@/lib/hooks/useCars";
import { createClient } from "@/lib/supabase/client";
import CarFormModal from "@/components/cars/CarFormModal";
import CarDetailDrawer from "@/components/cars/CarDetailDrawer";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  Search,
  Plus,
  Edit2,
  Trash2,
  Eye,
  Car as CarIcon,
  Loader2,
  AlertCircle,
  AlertTriangle,
  LayoutGrid,
  List,
} from "lucide-react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

export default function CarsPage() {
  const { data: cars, loading, error: fetchError, refetch } = useCars();
  const supabase = createClient();

  // Modals
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingCar, setEditingCar] = useState<any>(null);
  const [viewingCarId, setViewingCarId] = useState<string | null>(null);
  const [deletingCar, setDeletingCar] = useState<any>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);

  // Filters
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [fuelFilter, setFuelFilter] = useState("all");
  const [viewMode, setViewMode] = useState<"grid" | "table">("grid");

  // Status change in-line
  const [statusChanging, setStatusChanging] = useState<string | null>(null);

  const brands = useMemo(() => {
    const b = new Set(cars.map((c) => c.brand).filter(Boolean));
    return Array.from(b).sort();
  }, [cars]);

  const filteredCars = useMemo(() => {
    const q = searchQuery.toLowerCase();
    return cars.filter((car) => {
      const matchSearch =
        !q ||
        car.name?.toLowerCase().includes(q) ||
        car.plate_number?.toLowerCase().includes(q) ||
        car.brand?.toLowerCase().includes(q);
      const matchStatus =
        statusFilter === "all" || car.status?.toLowerCase() === statusFilter.toLowerCase();
      const matchFuel =
        fuelFilter === "all" || car.fuel_type?.toLowerCase() === fuelFilter.toLowerCase();
      return matchSearch && matchStatus && matchFuel;
    });
  }, [cars, searchQuery, statusFilter, fuelFilter]);

  const handleOpenAdd = () => {
    setEditingCar(null);
    setIsFormOpen(true);
  };

  const handleOpenEdit = (car: any) => {
    setEditingCar(car);
    setIsFormOpen(true);
  };

  const handleDelete = async () => {
    if (!deletingCar) return;
    if (deletingCar.status?.toLowerCase() === "rented") {
      setDeleteError("Cannot delete a car that is currently rented.");
      return;
    }
    setIsDeleting(true);
    setDeleteError(null);
    try {
      const { error } = await supabase.from("cars").delete().eq("id", deletingCar.id);
      if (error) throw error;
      setDeletingCar(null);
      refetch();
    } catch (err: any) {
      setDeleteError(err.message || "Failed to delete car");
    } finally {
      setIsDeleting(false);
    }
  };

  const handleStatusChange = async (carId: string, newStatus: string) => {
    setStatusChanging(carId);
    try {
      await supabase.from("cars").update({ status: newStatus }).eq("id", carId);
      refetch();
    } finally {
      setStatusChanging(null);
    }
  };

  const statusBadgeClass = (status: string) => {
    switch (status?.toLowerCase()) {
      case "available": return "bg-emerald-500 text-white hover:bg-emerald-600";
      case "rented": return "bg-blue-500 text-white hover:bg-blue-600";
      case "maintenance": return "bg-amber-500 text-white hover:bg-amber-600";
      case "sold": return "bg-gray-500 text-white hover:bg-gray-600";
      case "damaged": return "bg-red-500 text-white hover:bg-red-600";
      default: return "";
    }
  };

  return (
    <div className="flex-1 space-y-6 pb-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Fleet Management</h2>
          <p className="text-muted-foreground mt-1">
            {loading ? "Loading fleet..." : `${cars.length} vehicles registered`}
          </p>
        </div>
        <Button className="shrink-0 gap-2" onClick={handleOpenAdd}>
          <Plus className="h-4 w-4" /> Register Car
        </Button>
      </div>

      {/* Filter Bar */}
      <div className="flex flex-col sm:flex-row items-center gap-3 bg-muted/30 p-4 rounded-xl border">
        <div className="relative flex-1 w-full">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search name, plate, brand…"
            className="pl-9 bg-background"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <div className="flex gap-2 w-full sm:w-auto flex-wrap">
          <Select value={statusFilter} onValueChange={(v) => v && setStatusFilter(v)}>
            <SelectTrigger className="w-[130px] bg-background">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Statuses</SelectItem>
              <SelectItem value="Available">Available</SelectItem>
              <SelectItem value="Rented">Rented</SelectItem>
              <SelectItem value="Maintenance">Maintenance</SelectItem>
              <SelectItem value="Sold">Sold</SelectItem>
              <SelectItem value="Damaged">Damaged</SelectItem>
            </SelectContent>
          </Select>
          <Select value={fuelFilter} onValueChange={(v) => v && setFuelFilter(v)}>
            <SelectTrigger className="w-[130px] bg-background">
              <SelectValue placeholder="Fuel" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Fuels</SelectItem>
              <SelectItem value="Petrol">Petrol</SelectItem>
              <SelectItem value="Diesel">Diesel</SelectItem>
              <SelectItem value="Hybrid">Hybrid</SelectItem>
              <SelectItem value="Electric">Electric</SelectItem>
            </SelectContent>
          </Select>
          <div className="flex rounded-md border bg-background overflow-hidden">
            <Button
              variant="ghost"
              size="icon"
              className={`h-9 w-9 rounded-none ${viewMode === "grid" ? "bg-muted" : ""}`}
              onClick={() => setViewMode("grid")}
            >
              <LayoutGrid className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className={`h-9 w-9 rounded-none ${viewMode === "table" ? "bg-muted" : ""}`}
              onClick={() => setViewMode("table")}
            >
              <List className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>

      {/* Error */}
      {fetchError && (
        <div className="bg-destructive/10 text-destructive p-4 rounded-lg flex items-center gap-2">
          <AlertCircle className="h-5 w-5 shrink-0" />
          {fetchError}
        </div>
      )}

      {/* Content */}
      {loading ? (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {Array.from({ length: 8 }).map((_, i) => (
            <Card key={i} className="overflow-hidden animate-pulse">
              <div className="h-40 bg-muted" />
              <CardHeader className="pb-2 space-y-2">
                <div className="h-5 bg-muted rounded w-2/3" />
                <div className="h-4 bg-muted rounded w-1/3" />
              </CardHeader>
              <CardFooter className="py-3 justify-end gap-2">
                <div className="h-8 w-8 bg-muted rounded" />
                <div className="h-8 w-8 bg-muted rounded" />
                <div className="h-8 w-8 bg-muted rounded" />
              </CardFooter>
            </Card>
          ))}
        </div>
      ) : filteredCars.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-center border rounded-xl bg-muted/10">
          <CarIcon className="h-16 w-16 text-muted-foreground/30 mb-4" />
          <h3 className="text-xl font-semibold mb-2">
            {cars.length === 0 ? "No cars registered yet" : "No cars match your filters"}
          </h3>
          <p className="text-muted-foreground mb-6">
            {cars.length === 0
              ? "Register your first vehicle to get started."
              : "Try adjusting your search or filter criteria."}
          </p>
          {cars.length === 0 && (
            <Button onClick={handleOpenAdd} className="gap-2">
              <Plus className="h-4 w-4" /> Register First Car
            </Button>
          )}
        </div>
      ) : viewMode === "grid" ? (
        /* GRID VIEW */
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {filteredCars.map((car) => (
            <Card key={car.id} className="overflow-hidden flex flex-col group hover:shadow-md transition-shadow">
              {/* Photo */}
              <div className="relative h-40 bg-primary/5 overflow-hidden">
                {car.image_url ? (
                  <img src={car.image_url} alt={car.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <CarIcon className="h-16 w-16 text-primary/20" />
                  </div>
                )}
                {/* Alert dots */}
                {car.alerts?.length > 0 && (
                  <div className="absolute top-2 right-2 flex gap-1">
                    {car.alerts.some((a) => a.type === "error") && (
                      <div className="h-3 w-3 rounded-full bg-red-500 shadow" title={car.alerts.find((a) => a.type === "error")?.message} />
                    )}
                    {car.alerts.some((a) => a.type === "warning") && (
                      <div className="h-3 w-3 rounded-full bg-amber-400 shadow" title={car.alerts.find((a) => a.type === "warning")?.message} />
                    )}
                  </div>
                )}
                {/* Quick status badge */}
                <div className="absolute top-2 left-2">
                  <Badge className={`text-xs ${statusBadgeClass(car.status)}`}>{car.status}</Badge>
                </div>
              </div>

              <CardHeader className="pb-2 flex-1">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <h3 className="font-semibold text-base line-clamp-1">
                      {car.fleet_number && <Badge className="mr-1.5 bg-primary text-primary-foreground border-none px-1.5 py-0">{car.fleet_number}</Badge>}
                      {car.name}
                    </h3>
                    <p className="text-xs text-muted-foreground">{car.year} · {car.color}</p>
                  </div>
                  <Badge variant="outline" className="font-mono text-xs shrink-0">{car.plate_number}</Badge>
                </div>
                <div className="flex items-center justify-between mt-2">
                  <span className="text-xl font-bold">${car.price_per_day}<span className="text-xs text-muted-foreground font-normal">/day</span></span>
                  {car.mileage ? <span className="text-xs text-muted-foreground">{Number(car.mileage).toLocaleString()} km</span> : null}
                </div>
                {/* Alert messages */}
                {car.alerts?.length > 0 && (
                  <div className="mt-1 space-y-0.5">
                    {car.alerts.slice(0, 2).map((alert, i) => (
                      <p key={i} className={`text-xs flex items-center gap-1 ${alert.type === "error" ? "text-red-500" : "text-amber-500"}`}>
                        <AlertTriangle className="h-3 w-3 shrink-0" />
                        {alert.message}
                      </p>
                    ))}
                  </div>
                )}
              </CardHeader>

              <CardContent className="pb-2 px-4">
                {/* Quick status change */}
                <Select
                  value={car.status}
                  onValueChange={(v) => v && handleStatusChange(car.id, v)}
                  disabled={statusChanging === car.id}
                >
                  <SelectTrigger className="h-8 text-xs">
                    {statusChanging === car.id ? (
                      <span className="flex items-center gap-1"><Loader2 className="h-3 w-3 animate-spin" /> Updating…</span>
                    ) : (
                      <SelectValue />
                    )}
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Available">Available</SelectItem>
                    <SelectItem value="Rented">Rented</SelectItem>
                    <SelectItem value="Maintenance">Maintenance</SelectItem>
                    <SelectItem value="Sold">Sold</SelectItem>
                    <SelectItem value="Damaged">Damaged</SelectItem>
                  </SelectContent>
                </Select>
              </CardContent>

              <CardFooter className="py-2 px-4 flex justify-end gap-1 bg-muted/10 border-t">
                <Button variant="ghost" size="icon" className="h-8 w-8" title="View" onClick={() => setViewingCarId(car.id)}>
                  <Eye className="h-4 w-4" />
                </Button>
                <Button variant="ghost" size="icon" className="h-8 w-8" title="Edit" onClick={() => handleOpenEdit(car)}>
                  <Edit2 className="h-4 w-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 text-destructive hover:text-destructive hover:bg-destructive/10"
                  title="Delete"
                  onClick={() => { setDeleteError(null); setDeletingCar(car); }}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      ) : (
        /* TABLE VIEW */
        <Card>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Vehicle</TableHead>
                <TableHead>Plate</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Fuel</TableHead>
                <TableHead>Mileage</TableHead>
                <TableHead>Price/Day</TableHead>
                <TableHead>Alerts</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredCars.map((car) => (
                <TableRow key={car.id} className="group">
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-14 rounded bg-muted overflow-hidden shrink-0">
                        {car.image_url ? (
                          <img src={car.image_url} alt={car.name} className="w-full h-full object-cover" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            <CarIcon className="h-5 w-5 text-muted-foreground/40" />
                          </div>
                        )}
                      </div>
                      <div>
                        <p className="font-medium">{car.name}</p>
                        <p className="text-xs text-muted-foreground">{car.year} · {car.color}</p>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell><span className="font-mono text-xs">{car.plate_number}</span></TableCell>
                  <TableCell>
                    <Select value={car.status} onValueChange={(v) => v && handleStatusChange(car.id, v)} disabled={statusChanging === car.id}>
                      <SelectTrigger className="h-7 w-[120px] text-xs">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Available">Available</SelectItem>
                        <SelectItem value="Rented">Rented</SelectItem>
                        <SelectItem value="Maintenance">Maintenance</SelectItem>
                        <SelectItem value="Sold">Sold</SelectItem>
                        <SelectItem value="Damaged">Damaged</SelectItem>
                      </SelectContent>
                    </Select>
                  </TableCell>
                  <TableCell className="text-sm">{car.fuel_type || "—"}</TableCell>
                  <TableCell className="text-sm">{car.mileage ? `${Number(car.mileage).toLocaleString()} km` : "—"}</TableCell>
                  <TableCell className="font-medium">${car.price_per_day}</TableCell>
                  <TableCell>
                    {car.alerts?.length > 0 ? (
                      <div className="flex gap-1">
                        {car.alerts.map((a, i) => (
                          <span key={i} title={a.message}>
                            <AlertTriangle className={`h-4 w-4 ${a.type === "error" ? "text-red-500" : "text-amber-400"}`} />
                          </span>
                        ))}
                      </div>
                    ) : <span className="text-xs text-muted-foreground">—</span>}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => setViewingCarId(car.id)}>
                        <Eye className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => handleOpenEdit(car)}>
                        <Edit2 className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-destructive hover:text-destructive hover:bg-destructive/10"
                        onClick={() => { setDeleteError(null); setDeletingCar(car); }}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Card>
      )}

      {/* Add/Edit Modal */}
      {isFormOpen && (
        <CarFormModal
          open={isFormOpen}
          onClose={() => setIsFormOpen(false)}
          onSaved={() => { setIsFormOpen(false); refetch(); }}
          initialData={editingCar}
        />
      )}

      {/* Detail Drawer */}
      <CarDetailDrawer carId={viewingCarId} onClose={() => setViewingCarId(null)} />

      {/* Delete Confirm Dialog */}
      <AlertDialog open={!!deletingCar} onOpenChange={(o) => !o && setDeletingCar(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Vehicle</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete <strong>{deletingCar?.name}</strong>? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          {deleteError && (
            <div className="bg-destructive/10 text-destructive text-sm p-3 rounded-md flex items-center gap-2">
              <AlertCircle className="h-4 w-4 shrink-0" />
              {deleteError}
            </div>
          )}
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              disabled={isDeleting}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {isDeleting ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
              Delete Vehicle
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
