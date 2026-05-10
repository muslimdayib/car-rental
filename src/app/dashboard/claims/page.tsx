"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
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
import { Search, Plus, FileText, UploadCloud, X, AlertTriangle, CheckCircle2, FileQuestion, DollarSign, Car, User } from "lucide-react";

const HARDCODED_CLAIMS = [
  {
    id: "CLM-001",
    car: "Tesla Model 3",
    driver: "Ahmad Yasin",
    date: "May 02, 2026",
    incidentType: "Collision",
    amount: "$4,500",
    provider: "Premium Guard",
    status: "Under Investigation",
    description: "Rear-ended at traffic light. Minor bumper and sensor damage.",
    files: ["police_report.pdf", "scene_photos.zip"]
  },
  {
    id: "CLM-002",
    car: "Honda Civic Sport",
    driver: "James Wilson",
    date: "Apr 28, 2026",
    incidentType: "Vandalism",
    amount: "$850",
    provider: "SecureRide Ins.",
    status: "Open",
    description: "Passenger side window smashed while parked overnight.",
    files: ["window_damage.jpg"]
  },
  {
    id: "CLM-003",
    car: "Ford Mustang GT",
    driver: "Carlos Rivera",
    date: "Apr 15, 2026",
    incidentType: "Weather Damage",
    amount: "$3,200",
    provider: "SafeDrive Auto",
    status: "Approved",
    description: "Hail damage to hood and roof during severe storm.",
    files: ["weather_report.pdf", "estimate_quote.pdf"]
  },
  {
    id: "CLM-004",
    car: "Toyota Camry SE",
    driver: "Samuel Osei",
    date: "Mar 10, 2026",
    incidentType: "Collision",
    amount: "$12,500",
    provider: "Premium Guard",
    status: "Settled",
    description: "T-bone collision at intersection. Significant driver-side damage.",
    files: ["final_invoice.pdf"]
  },
  {
    id: "CLM-005",
    car: "BMW 5 Series",
    driver: "David Chen",
    date: "May 01, 2026",
    incidentType: "Theft",
    amount: "$0",
    provider: "SecureRide Ins.",
    status: "Rejected",
    description: "Reported stolen but recovered within 12 hours with no damage.",
    files: ["police_recovery.pdf", "investigation_notes.docx"]
  }
];

import { useState } from "react";

export default function ClaimsPage() {
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const getStatusBadge = (status: string) => {
    switch (status) {
      case "Open": return <Badge className="bg-blue-500 hover:bg-blue-600">Open</Badge>;
      case "Under Investigation": return <Badge className="bg-amber-500 hover:bg-amber-600">Under Investigation</Badge>;
      case "Approved": return <Badge className="bg-emerald-500 hover:bg-emerald-600">Approved</Badge>;
      case "Settled": return <Badge variant="outline" className="text-emerald-500 border-emerald-500">Settled</Badge>;
      case "Rejected": return <Badge variant="destructive">Rejected</Badge>;
      default: return <Badge>{status}</Badge>;
    }
  };

  const getTypeBadge = (type: string) => {
    switch (type) {
      case "Collision": return <Badge variant="secondary" className="border-orange-200 text-orange-700 bg-orange-100">Collision</Badge>;
      case "Vandalism": return <Badge variant="secondary" className="border-purple-200 text-purple-700 bg-purple-100">Vandalism</Badge>;
      case "Weather Damage": return <Badge variant="secondary" className="border-cyan-200 text-cyan-700 bg-cyan-100">Weather</Badge>;
      case "Theft": return <Badge variant="secondary" className="border-red-200 text-red-700 bg-red-100">Theft</Badge>;
      default: return <Badge variant="outline">{type}</Badge>;
    }
  };

  return (
    <div className="flex-1 space-y-6 pb-8">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Insurance Claims</h2>
          <p className="text-muted-foreground mt-1">File incidents, track investigation statuses, and manage claim payouts.</p>
        </div>

        <div className="flex items-center gap-4 w-full sm:w-auto">
          <div className="relative w-full sm:w-[300px]">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input placeholder="Search claims or vehicles..." className="pl-8 bg-background" />
          </div>

          <Dialog open={isAddModalOpen} onOpenChange={setIsAddModalOpen}>
            <DialogTrigger>
              <Button className="shrink-0 gap-2">
                <Plus className="h-4 w-4" />
                File Claim
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[550px] max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>File New Insurance Claim</DialogTitle>
                <DialogDescription>
                  Report a new incident to initiate the claims process.
                </DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Select Vehicle</Label>
                    <Select>
                      <SelectTrigger><SelectValue placeholder="Choose car" /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="c1">Tesla Model 3</SelectItem>
                        <SelectItem value="c2">Toyota Camry SE</SelectItem>
                        <SelectItem value="c3">Ford Mustang GT</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Driver Involved</Label>
                    <Select>
                      <SelectTrigger><SelectValue placeholder="Choose driver" /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="d1">Ahmad Yasin</SelectItem>
                        <SelectItem value="d2">James Wilson</SelectItem>
                        <SelectItem value="d3">Carlos Rivera</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Incident Date</Label>
                    <Input type="date" />
                  </div>
                  <div className="space-y-2">
                    <Label>Incident Type</Label>
                    <Select>
                      <SelectTrigger><SelectValue placeholder="Select type" /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="collision">Collision</SelectItem>
                        <SelectItem value="vandalism">Vandalism</SelectItem>
                        <SelectItem value="weather">Weather Damage</SelectItem>
                        <SelectItem value="theft">Theft</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>Incident Description</Label>
                  <textarea 
                    className="flex min-h-[80px] w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                    placeholder="Provide details of how the incident occurred..."
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Estimated Cost ($)</Label>
                    <Input placeholder="0.00" type="number" />
                  </div>
                  <div className="space-y-2">
                    <Label>Applicable Policy</Label>
                    <Select>
                      <SelectTrigger><SelectValue placeholder="Select policy" /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="p1">POL-882731 (SafeDrive)</SelectItem>
                        <SelectItem value="p2">POL-552618 (Premium Guard)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setIsAddModalOpen(false)}>Cancel</Button>
                <Button>Submit Claim</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Open Claims</CardTitle>
            <AlertTriangle className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-500">8</div>
            <p className="text-xs text-muted-foreground mt-1">Pending initial review</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Under Investigation</CardTitle>
            <FileQuestion className="h-4 w-4 text-amber-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-amber-500">3</div>
            <p className="text-xs text-muted-foreground mt-1">Awaiting adjuster reports</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Settled This Year</CardTitle>
            <CheckCircle2 className="h-4 w-4 text-emerald-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">24</div>
            <p className="text-xs text-emerald-500 mt-1 flex items-center">Successfully closed</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Total Payouts</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">$42,850</div>
            <p className="text-xs text-muted-foreground mt-1">YTD recovered funds</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
        {HARDCODED_CLAIMS.map((claim) => (
          <Card key={claim.id} className="flex flex-col overflow-hidden">
            <CardHeader className="pb-3 border-b bg-muted/20">
              <div className="flex justify-between items-start mb-2">
                <div>
                  <h3 className="font-bold text-lg">{claim.id}</h3>
                  <p className="text-sm text-muted-foreground">{claim.date}</p>
                </div>
                {getStatusBadge(claim.status)}
              </div>
              <div className="flex items-center gap-2 mt-1">
                {getTypeBadge(claim.incidentType)}
                <Badge variant="outline" className="font-semibold ml-auto">{claim.amount}</Badge>
              </div>
            </CardHeader>
            <CardContent className="pt-4 flex-1 space-y-4">
              <div className="grid grid-cols-2 gap-y-3 gap-x-2 text-sm">
                <div>
                  <p className="text-muted-foreground mb-0.5 text-xs flex items-center"><Car className="w-3 h-3 mr-1" /> Vehicle</p>
                  <p className="font-medium">{claim.car}</p>
                </div>
                <div>
                  <p className="text-muted-foreground mb-0.5 text-xs flex items-center"><User className="w-3 h-3 mr-1" /> Driver</p>
                  <p className="font-medium">{claim.driver}</p>
                </div>
                <div className="col-span-2">
                  <p className="text-muted-foreground mb-0.5 text-xs flex items-center"><FileText className="w-3 h-3 mr-1" /> Provider</p>
                  <p className="font-medium">{claim.provider}</p>
                </div>
              </div>
              
              <div className="p-3 bg-muted/30 rounded-md border text-sm">
                <p className="font-medium text-xs text-muted-foreground mb-1 uppercase tracking-wider">Description</p>
                <p className="text-foreground">{claim.description}</p>
              </div>
            </CardContent>
            <CardFooter className="flex-col items-stretch p-0 border-t bg-muted/10">
              <div className="p-4 space-y-3">
                <p className="font-medium text-xs text-muted-foreground uppercase tracking-wider">Supporting Documents</p>
                
                {/* File list */}
                <div className="space-y-2">
                  {claim.files.map((file, idx) => (
                    <div key={idx} className="flex items-center justify-between p-2 bg-background border rounded-md text-sm">
                      <div className="flex items-center gap-2 overflow-hidden">
                        <FileText className="w-4 h-4 text-blue-500 shrink-0" />
                        <span className="truncate text-xs font-medium">{file}</span>
                      </div>
                      <Button variant="ghost" size="icon" className="h-6 w-6 text-muted-foreground hover:text-red-500 shrink-0">
                        <X className="w-3 h-3" />
                      </Button>
                    </div>
                  ))}
                </div>

                {/* Upload zone */}
                <div className="mt-3 border-2 border-dashed border-muted-foreground/30 rounded-lg p-4 flex flex-col items-center justify-center text-center cursor-pointer hover:bg-muted/30 transition-colors">
                  <UploadCloud className="w-6 h-6 text-muted-foreground mb-2" />
                  <p className="text-sm font-medium">Drop documents here</p>
                  <p className="text-xs text-muted-foreground mt-0.5">or click to browse</p>
                </div>
              </div>
            </CardFooter>
          </Card>
        ))}
      </div>
    </div>
  );
}
