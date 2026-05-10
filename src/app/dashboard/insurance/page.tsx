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
import { Search, Plus, ShieldCheck, AlertTriangle, ShieldAlert, DollarSign, CalendarDays } from "lucide-react";

const HARDCODED_INSURANCE = [
  { id: 1, car: "Toyota Camry SE", provider: "SafeDrive Auto", policyNo: "POL-882731", type: "Comprehensive", start: "Jan 01, 2026", expiry: "Dec 31, 2026", premium: "$1,200", status: "Active", condition: "normal" },
  { id: 2, car: "Honda Civic Sport", provider: "SecureRide Ins.", policyNo: "POL-992837", type: "Liability Only", start: "Jun 15, 2025", expiry: "Jun 14, 2026", premium: "$850", status: "Active", condition: "normal" },
  { id: 3, car: "Tesla Model 3", provider: "Premium Guard", policyNo: "POL-552618", type: "Comprehensive", start: "May 20, 2025", expiry: "May 10, 2026", premium: "$2,400", status: "Expiring Soon", condition: "expiring" },
  { id: 4, car: "Ford Mustang GT", provider: "SafeDrive Auto", policyNo: "POL-773821", type: "Comprehensive", start: "Apr 10, 2025", expiry: "Apr 09, 2026", premium: "$1,850", status: "Expired", condition: "expired" },
  { id: 5, car: "BMW 5 Series", provider: "Premium Guard", policyNo: "POL-441092", type: "Comprehensive", start: "Aug 01, 2025", expiry: "Jul 31, 2026", premium: "$2,100", status: "Active", condition: "normal" },
  { id: 6, car: "Mercedes C300", provider: "SecureRide Ins.", policyNo: "POL-229845", type: "Comprehensive", start: "Sep 15, 2025", expiry: "Sep 14, 2026", premium: "$1,950", status: "Active", condition: "normal" },
  { id: 7, car: "Audi A4 Premium", provider: "SafeDrive Auto", policyNo: "POL-119283", type: "Liability Only", start: "May 25, 2025", expiry: "May 12, 2026", premium: "$920", status: "Expiring Soon", condition: "expiring" },
  { id: 8, car: "Hyundai Tucson", provider: "SecureRide Ins.", policyNo: "POL-330192", type: "Comprehensive", start: "Feb 10, 2026", expiry: "Feb 09, 2027", premium: "$1,100", status: "Active", condition: "normal" },
];

import { useState } from "react";

export default function InsurancePage() {
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const getStatusBadge = (status: string) => {
    switch (status) {
      case "Active": return <Badge className="bg-emerald-500 hover:bg-emerald-600">Active</Badge>;
      case "Expiring Soon": return <Badge className="bg-amber-500 hover:bg-amber-600">Expiring Soon</Badge>;
      case "Expired": return <Badge variant="destructive" className="bg-red-500 hover:bg-red-600">Expired</Badge>;
      default: return <Badge>{status}</Badge>;
    }
  };

  const getRowClass = (condition: string) => {
    if (condition === "expiring") return "border-l-4 border-l-amber-500 bg-amber-500/5";
    if (condition === "expired") return "border-l-4 border-l-red-500 bg-red-500/5";
    return "border-l-4 border-l-transparent";
  };

  return (
    <div className="flex-1 space-y-6 pb-8">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Insurance Policies</h2>
          <p className="text-muted-foreground mt-1">Manage fleet coverage, track expiry dates, and review premiums.</p>
        </div>

        <div className="flex items-center gap-4 w-full sm:w-auto">
          <div className="relative w-full sm:w-[300px]">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input placeholder="Search policy number or vehicle..." className="pl-8 bg-background" />
          </div>

          <Dialog open={isAddModalOpen} onOpenChange={setIsAddModalOpen}>
            <DialogTrigger asChild>
              <Button className="shrink-0 gap-2">
                <Plus className="h-4 w-4" />
                Add Policy
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[500px]">
              <DialogHeader>
                <DialogTitle>Register Insurance Policy</DialogTitle>
                <DialogDescription>
                  Enter the details for a new or renewed vehicle insurance policy.
                </DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="space-y-2">
                  <Label>Select Vehicle</Label>
                  <Select>
                    <SelectTrigger><SelectValue placeholder="Choose car" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="c1">FL-001 — Tesla Model 3</SelectItem>
                      <SelectItem value="c2">FL-002 — Toyota Camry SE</SelectItem>
                      <SelectItem value="c3">FL-003 — Ford Mustang GT</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Provider Name</Label>
                    <Input placeholder="e.g. SafeDrive Auto" />
                  </div>
                  <div className="space-y-2">
                    <Label>Policy Number</Label>
                    <Input placeholder="e.g. POL-123456" className="font-mono uppercase" />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>Policy Type</Label>
                  <Select>
                    <SelectTrigger><SelectValue placeholder="Select type" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="comp">Comprehensive</SelectItem>
                      <SelectItem value="liab">Liability Only</SelectItem>
                      <SelectItem value="coll">Collision</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Start Date</Label>
                    <Input type="date" />
                  </div>
                  <div className="space-y-2">
                    <Label>End Date</Label>
                    <Input type="date" />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>Annual Premium ($)</Label>
                  <Input placeholder="0.00" type="number" />
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setIsAddModalOpen(false)}>Cancel</Button>
                <Button>Save Policy</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Total Policies</CardTitle>
            <ShieldCheck className="h-4 w-4 text-emerald-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">48</div>
            <p className="text-xs text-muted-foreground mt-1">Active fleet coverage</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Expiring in 30 Days</CardTitle>
            <AlertTriangle className="h-4 w-4 text-amber-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-amber-500">2</div>
            <p className="text-xs text-muted-foreground mt-1 flex items-center">Action required soon</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Expired</CardTitle>
            <ShieldAlert className="h-4 w-4 text-red-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-500">1</div>
            <p className="text-xs text-muted-foreground mt-1">Immediate renewal needed</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Total Annual Premium</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">$68,500</div>
            <p className="text-xs text-muted-foreground mt-1">Fleet insurance cost</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Policy Directory</CardTitle>
        </CardHeader>
        <CardContent className="p-0 sm:p-6 sm:pt-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Car</TableHead>
                <TableHead>Provider</TableHead>
                <TableHead>Policy Number</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Start Date</TableHead>
                <TableHead>Expiry Date</TableHead>
                <TableHead>Premium</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {HARDCODED_INSURANCE.map((policy) => (
                <TableRow key={policy.id} className={`hover:bg-muted/50 transition-colors ${getRowClass(policy.condition)}`}>
                  <TableCell className="font-medium">{policy.car}</TableCell>
                  <TableCell>{policy.provider}</TableCell>
                  <TableCell>
                    <Badge variant="outline" className="font-mono bg-muted/50">{policy.policyNo}</Badge>
                  </TableCell>
                  <TableCell>{policy.type}</TableCell>
                  <TableCell className="text-muted-foreground">{policy.start}</TableCell>
                  <TableCell className={`font-medium ${policy.condition === "expired" ? "text-red-500" : policy.condition === "expiring" ? "text-amber-500" : ""}`}>
                    {policy.expiry}
                  </TableCell>
                  <TableCell className="font-semibold">{policy.premium}</TableCell>
                  <TableCell>{getStatusBadge(policy.status)}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
