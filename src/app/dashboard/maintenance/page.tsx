"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
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
import { Search, Plus, Wrench, AlertTriangle, CheckCircle2, Clock, DollarSign, CalendarClock } from "lucide-react";

const HARDCODED_MAINTENANCE = [
  { id: "MNT-001", car: "Ford Mustang GT", issue: "Engine Diagnostics & Tune-up", mechanic: "Marcus Johnson", start: "May 02, 2026", end: "May 05, 2026", cost: "$850", status: "In Progress" },
  { id: "MNT-002", car: "Honda Civic Sport", issue: "Brake Pad Replacement", mechanic: "Daniel White", start: "May 04, 2026", end: "May 04, 2026", cost: "$220", status: "Completed" },
  { id: "MNT-003", car: "BMW 5 Series", issue: "Transmission Fluid Leak", mechanic: "Marcus Johnson", start: "May 05, 2026", end: "May 08, 2026", cost: "$1,200", status: "Critical" },
  { id: "MNT-004", car: "Tesla Model 3", issue: "Battery Coolant Flush", mechanic: "Sarah Palmer", start: "May 10, 2026", end: "May 11, 2026", cost: "$350", status: "Scheduled" },
  { id: "MNT-005", car: "Toyota Camry SE", issue: "Routine 10k Service", mechanic: "Daniel White", start: "Apr 28, 2026", end: "Apr 29, 2026", cost: "$180", status: "Completed" },
  { id: "MNT-006", car: "Mercedes C300", issue: "Suspension Assessment", mechanic: "External Vendor", start: "May 01, 2026", end: "May 06, 2026", cost: "$450", status: "In Progress" },
  { id: "MNT-007", car: "Audi A4 Premium", issue: "Air Conditioning Repair", mechanic: "Sarah Palmer", start: "May 15, 2026", end: "May 16, 2026", cost: "$280", status: "Scheduled" },
];

import { useState } from "react";

export default function MaintenancePage() {
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const getStatusBadge = (status: string) => {
    switch(status) {
      case "Completed": return <Badge variant="outline" className="text-emerald-500 border-emerald-500 bg-emerald-500/10"><CheckCircle2 className="w-3 h-3 mr-1"/> Completed</Badge>;
      case "In Progress": return <Badge className="bg-blue-500 hover:bg-blue-600"><Wrench className="w-3 h-3 mr-1"/> In Progress</Badge>;
      case "Critical": return <Badge variant="destructive" className="bg-red-500 hover:bg-red-600"><AlertTriangle className="w-3 h-3 mr-1"/> Critical</Badge>;
      case "Scheduled": return <Badge variant="secondary"><Clock className="w-3 h-3 mr-1"/> Scheduled</Badge>;
      default: return <Badge>{status}</Badge>;
    }
  };

  return (
    <div className="flex-1 space-y-6 pb-8">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Maintenance</h2>
          <p className="text-muted-foreground mt-1">Track vehicle repairs, service schedules, and maintenance costs.</p>
        </div>

        <div className="flex items-center gap-4 w-full sm:w-auto">
          <div className="relative w-full sm:w-[300px]">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input placeholder="Search job ID or vehicle..." className="pl-8 bg-background" />
          </div>

          <Dialog open={isAddModalOpen} onOpenChange={setIsAddModalOpen}>
            <DialogTrigger asChild>
              <Button className="shrink-0 gap-2">
                <Plus className="h-4 w-4" />
                Add Maintenance
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[500px]">
              <DialogHeader>
                <DialogTitle>Create Maintenance Job</DialogTitle>
                <DialogDescription>
                  Log a new repair or scheduled service for a vehicle.
                </DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Select Vehicle</Label>
                    <Select>
                      <SelectTrigger><SelectValue placeholder="Choose car" /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="c1">FL-001 — Tesla Model 3</SelectItem>
                        <SelectItem value="c2">FL-002 — Toyota Camry SE</SelectItem>
                        <SelectItem value="c3">FL-003 — Honda Civic</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Issue Type</Label>
                    <Select>
                      <SelectTrigger><SelectValue placeholder="Select type" /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="routine">Routine Service</SelectItem>
                        <SelectItem value="repair">Mechanical Repair</SelectItem>
                        <SelectItem value="bodywork">Body Work</SelectItem>
                        <SelectItem value="electrical">Electrical</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>Description</Label>
                  <textarea 
                    className="flex min-h-[80px] w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                    placeholder="Describe the issue or required service..."
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Assigned Mechanic</Label>
                    <Select>
                      <SelectTrigger><SelectValue placeholder="Select mechanic" /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="m1">Marcus Johnson</SelectItem>
                        <SelectItem value="m2">Daniel White</SelectItem>
                        <SelectItem value="ext">External Vendor</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Estimated Cost ($)</Label>
                    <Input placeholder="0.00" type="number" />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>Priority</Label>
                  <Select>
                    <SelectTrigger><SelectValue placeholder="Select priority" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="low">Low</SelectItem>
                      <SelectItem value="medium">Medium</SelectItem>
                      <SelectItem value="high">High</SelectItem>
                      <SelectItem value="critical">Critical</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setIsAddModalOpen(false)}>Cancel</Button>
                <Button>Save Job</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Total Cost This Month</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">$3,530</div>
            <p className="text-xs text-muted-foreground mt-1">Across 12 jobs</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Open Jobs</CardTitle>
            <Wrench className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">4</div>
            <p className="text-xs text-amber-500 mt-1 flex items-center">1 marked as Critical</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Completed</CardTitle>
            <CheckCircle2 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-emerald-500">28</div>
            <p className="text-xs text-muted-foreground mt-1">Last 30 days</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Avg Resolution Days</CardTitle>
            <CalendarClock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">2.4</div>
            <p className="text-xs text-emerald-500 mt-1">-0.3 days from last month</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Maintenance Logs</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Car</TableHead>
                <TableHead>Issue</TableHead>
                <TableHead>Mechanic</TableHead>
                <TableHead>Start Date</TableHead>
                <TableHead>Expected End</TableHead>
                <TableHead>Cost</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {HARDCODED_MAINTENANCE.map((job) => (
                <TableRow key={job.id} className="hover:bg-muted/50 transition-colors">
                  <TableCell className="font-medium">{job.car}</TableCell>
                  <TableCell>{job.issue}</TableCell>
                  <TableCell className="text-muted-foreground">{job.mechanic}</TableCell>
                  <TableCell>{job.start}</TableCell>
                  <TableCell>{job.end}</TableCell>
                  <TableCell className="font-medium">{job.cost}</TableCell>
                  <TableCell>{getStatusBadge(job.status)}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
