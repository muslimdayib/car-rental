"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Label } from "@/components/ui/label";
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
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Search, Plus, Fuel, Droplet, DollarSign, CarFront } from "lucide-react";

const HARDCODED_FUEL_LOGS = [
  { id: "FL-1001", car: "Toyota Camry SE", driver: "Ahmad Yasin", date: "May 05, 2026", station: "Shell #142", liters: "42.5", costPerLiter: "$1.45", totalCost: "$61.63", odometer: "45,210 km" },
  { id: "FL-1002", car: "Honda Civic Sport", driver: "James Wilson", date: "May 04, 2026", station: "BP Express", liters: "38.0", costPerLiter: "$1.42", totalCost: "$53.96", odometer: "28,150 km" },
  { id: "FL-1003", car: "Ford Mustang GT", driver: "Carlos Rivera", date: "May 03, 2026", station: "Chevron Prime", liters: "55.2", costPerLiter: "$1.55", totalCost: "$85.56", odometer: "12,890 km" },
  { id: "FL-1004", car: "BMW 5 Series", driver: "David Chen", date: "May 02, 2026", station: "Exxon Mobil", liters: "60.0", costPerLiter: "$1.50", totalCost: "$90.00", odometer: "33,400 km" },
  { id: "FL-1005", car: "Mercedes C300", driver: "Samuel Osei", date: "May 01, 2026", station: "Shell #142", liters: "45.8", costPerLiter: "$1.48", totalCost: "$67.78", odometer: "18,650 km" },
  { id: "FL-1006", car: "Toyota Camry SE", driver: "Ahmad Yasin", date: "Apr 28, 2026", station: "Texaco Star", liters: "40.0", costPerLiter: "$1.44", totalCost: "$57.60", odometer: "44,600 km" },
  { id: "FL-1007", car: "Honda CR-V", driver: "James Wilson", date: "Apr 27, 2026", station: "BP Express", liters: "48.5", costPerLiter: "$1.42", totalCost: "$68.87", odometer: "55,200 km" },
  { id: "FL-1008", car: "Audi A4 Premium", driver: "David Chen", date: "Apr 25, 2026", station: "Chevron Prime", liters: "52.0", costPerLiter: "$1.49", totalCost: "$77.48", odometer: "21,100 km" },
];

import { useState } from "react";

export default function FuelLogsPage() {
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  return (
    <div className="flex-1 space-y-6 pb-8">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Fuel Logs</h2>
          <p className="text-muted-foreground mt-1">Monitor fuel consumption, costs, and vehicle efficiency.</p>
        </div>

        <div className="flex items-center gap-4 w-full sm:w-auto">
          <div className="relative w-full sm:w-[300px]">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input placeholder="Search logs or vehicles..." className="pl-8 bg-background" />
          </div>

          <Dialog open={isAddModalOpen} onOpenChange={setIsAddModalOpen}>
            <DialogTrigger asChild>
              <Button className="shrink-0 gap-2">
                <Plus className="h-4 w-4" />
                Log Fuel
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[500px]">
              <DialogHeader>
                <DialogTitle>Add Fuel Log</DialogTitle>
                <DialogDescription>
                  Record a new refueling transaction for a vehicle.
                </DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Vehicle</Label>
                    <Select>
                      <SelectTrigger><SelectValue placeholder="Select car" /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="c1">FL-002 — Toyota Camry SE</SelectItem>
                        <SelectItem value="c2">FL-003 — Honda Civic Sport</SelectItem>
                        <SelectItem value="c3">FL-004 — Ford Mustang GT</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Driver</Label>
                    <Select>
                      <SelectTrigger><SelectValue placeholder="Select driver" /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="d1">Ahmad Yasin</SelectItem>
                        <SelectItem value="d2">Carlos Rivera</SelectItem>
                        <SelectItem value="d3">David Chen</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Date</Label>
                    <Input type="date" />
                  </div>
                  <div className="space-y-2">
                    <Label>Station Name</Label>
                    <Input placeholder="e.g. Shell, BP..." />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Liters Filled</Label>
                    <Input placeholder="0.0" type="number" step="0.1" />
                  </div>
                  <div className="space-y-2">
                    <Label>Cost per Liter ($)</Label>
                    <Input placeholder="0.00" type="number" step="0.01" />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>Current Odometer (km)</Label>
                  <Input placeholder="e.g. 45000" type="number" />
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setIsAddModalOpen(false)}>Cancel</Button>
                <Button>Save Log</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Total Fuel Cost</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">$12,450</div>
            <p className="text-xs text-red-500 mt-1 flex items-center">+4.2% from last month</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Total Liters</CardTitle>
            <Droplet className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">8,420 L</div>
            <p className="text-xs text-muted-foreground mt-1">Consumed this month</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Avg Cost/Liter</CardTitle>
            <Fuel className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">$1.48</div>
            <p className="text-xs text-emerald-500 mt-1">-0.02 from last month</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Most Consuming Car</CardTitle>
            <CarFront className="h-4 w-4 text-amber-500" />
          </CardHeader>
          <CardContent>
            <div className="text-lg font-bold truncate">Ford Mustang GT</div>
            <p className="text-xs text-muted-foreground mt-1">620 L this month</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Recent Fuel Transactions</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Car</TableHead>
                <TableHead>Driver</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Station</TableHead>
                <TableHead>Liters</TableHead>
                <TableHead>Cost/Liter</TableHead>
                <TableHead>Total Cost</TableHead>
                <TableHead>Odometer</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {HARDCODED_FUEL_LOGS.map((log) => (
                <TableRow key={log.id} className="hover:bg-muted/50 transition-colors">
                  <TableCell className="font-medium">{log.car}</TableCell>
                  <TableCell>{log.driver}</TableCell>
                  <TableCell className="text-muted-foreground">{log.date}</TableCell>
                  <TableCell>{log.station}</TableCell>
                  <TableCell>{log.liters}</TableCell>
                  <TableCell className="text-muted-foreground">{log.costPerLiter}</TableCell>
                  <TableCell className="font-bold">{log.totalCost}</TableCell>
                  <TableCell className="font-mono text-xs">{log.odometer}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <div className="mt-8">
        <h3 className="text-lg font-semibold mb-4">Analytics</h3>
        <Card>
          <CardContent className="p-6">
            <div className="flex h-[300px] w-full flex-col items-center justify-center rounded-lg border-2 border-dashed border-muted-foreground/20 bg-muted/10">
              <span className="text-muted-foreground font-medium text-lg">Fuel Efficiency by Car (km/L)</span>
              <span className="text-xs text-muted-foreground/60 mt-2">Bar Chart Placeholder</span>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
