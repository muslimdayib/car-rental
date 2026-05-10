"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Car, DollarSign, TrendingUp, TrendingDown, BadgeDollarSign, Plus } from "lucide-react";

const CAR_SALES_DATA = [
  {
    id: 1,
    car: "2018 Toyota Camry",
    plate: "ABC-8899",
    purchasePrice: "$22,000",
    bookValue: "$12,500",
    salePrice: "$14,000",
    profit: "+$1,500",
    profitType: "positive",
    date: "Oct 12, 2025",
    buyer: "John Smith",
    status: "Completed",
  },
  {
    id: 2,
    car: "2019 Honda Accord",
    plate: "XYZ-1122",
    purchasePrice: "$24,500",
    bookValue: "$15,200",
    salePrice: "$14,500",
    profit: "-$700",
    profitType: "negative",
    date: "Nov 05, 2025",
    buyer: "Elite Motors Auto",
    status: "Completed",
  },
  {
    id: 3,
    car: "2020 Ford Explorer",
    plate: "EXP-5555",
    purchasePrice: "$38,000",
    bookValue: "$22,000",
    salePrice: "$25,500",
    profit: "+$3,500",
    profitType: "positive",
    date: "Jan 18, 2026",
    buyer: "Sarah Connor",
    status: "Completed",
  },
  {
    id: 4,
    car: "2017 BMW 3 Series",
    plate: "BIM-330",
    purchasePrice: "$35,000",
    bookValue: "$14,000",
    salePrice: "$12,500",
    profit: "-$1,500",
    profitType: "negative",
    date: "Feb 22, 2026",
    buyer: "Fast Auto Sales",
    status: "Processing",
  },
  {
    id: 5,
    car: "2021 Tesla Model Y",
    plate: "EVC-9090",
    purchasePrice: "$55,000",
    bookValue: "$38,500",
    salePrice: "$41,000",
    profit: "+$2,500",
    profitType: "positive",
    date: "Mar 10, 2026",
    buyer: "Michael Johnson",
    status: "Pending Funds",
  },
];

import { useState } from "react";

export default function CarSalesPage() {
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  return (
    <div className="flex-1 space-y-6 pb-8">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Car Sales</h2>
          <p className="text-muted-foreground mt-1">Manage retired fleet vehicles and track sale profitability.</p>
        </div>

        <Dialog open={isAddModalOpen} onOpenChange={setIsAddModalOpen}>
          <DialogTrigger>
            <Button className="shrink-0 gap-2">
              <Plus className="h-4 w-4" />
              Sell Car
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[500px]">
            <DialogHeader>
              <DialogTitle>Register Car Sale</DialogTitle>
              <DialogDescription>
                Retire a vehicle from the active fleet and record its sale details.
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="space-y-2">
                <Label>Select Vehicle</Label>
                <Select>
                  <SelectTrigger>
                    <SelectValue placeholder="Search by plate or name" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="c1">2016 Nissan Altima (NIS-111)</SelectItem>
                    <SelectItem value="c2">2018 Chevy Malibu (CHV-222)</SelectItem>
                    <SelectItem value="c3">2019 Hyundai Sonata (HYN-333)</SelectItem>
                  </SelectContent>
                </Select>
                <p className="text-xs text-muted-foreground mt-1 text-right">Current Book Value: <span className="font-medium text-foreground">$10,500</span></p>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Sale Price ($)</Label>
                  <Input type="number" placeholder="e.g. 11000" />
                </div>
                <div className="space-y-2">
                  <Label>Sale Date</Label>
                  <Input type="date" />
                </div>
              </div>
              <div className="space-y-2">
                <Label>Buyer Name / Company</Label>
                <Input placeholder="Enter buyer details" />
              </div>
              <div className="space-y-2">
                <Label>Additional Notes</Label>
                <textarea 
                  className="flex min-h-[80px] w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                  placeholder="Payment terms, auction details, condition notes..."
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsAddModalOpen(false)}>Cancel</Button>
              <Button>Confirm Sale</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Cars Sold This Year</CardTitle>
            <Car className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">14</div>
            <p className="text-xs text-muted-foreground mt-1">Target: 20 retired</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Total Sale Revenue</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">$215,400</div>
            <p className="text-xs text-emerald-500 mt-1 flex items-center"><TrendingUp className="h-3 w-3 mr-1"/> +12% YoY</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Total Profit/Loss</CardTitle>
            <BadgeDollarSign className="h-4 w-4 text-emerald-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-emerald-500">+$18,250</div>
            <p className="text-xs text-muted-foreground mt-1">Above book value</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Avg Sale vs Book</CardTitle>
            <TrendingUp className="h-4 w-4 text-emerald-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-emerald-500">+8.5%</div>
            <p className="text-xs text-muted-foreground mt-1">Overall margin</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Recent Sales Transactions</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Car</TableHead>
                <TableHead>Plate</TableHead>
                <TableHead>Purchase Price</TableHead>
                <TableHead>Book Value</TableHead>
                <TableHead>Sale Price</TableHead>
                <TableHead>Profit / Loss</TableHead>
                <TableHead>Sale Date</TableHead>
                <TableHead>Buyer</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {CAR_SALES_DATA.map((sale) => (
                <TableRow key={sale.id} className="hover:bg-muted/50 transition-colors">
                  <TableCell className="font-medium">{sale.car}</TableCell>
                  <TableCell>
                    <Badge variant="outline" className="font-mono bg-muted/50">{sale.plate}</Badge>
                  </TableCell>
                  <TableCell className="text-muted-foreground">{sale.purchasePrice}</TableCell>
                  <TableCell>{sale.bookValue}</TableCell>
                  <TableCell className="font-bold">{sale.salePrice}</TableCell>
                  <TableCell>
                    <span className={`font-semibold flex items-center ${sale.profitType === "positive" ? "text-emerald-500" : "text-red-500"}`}>
                      {sale.profitType === "positive" ? <TrendingUp className="h-3 w-3 mr-1" /> : <TrendingDown className="h-3 w-3 mr-1" />}
                      {sale.profit}
                    </span>
                  </TableCell>
                  <TableCell className="text-muted-foreground">{sale.date}</TableCell>
                  <TableCell>{sale.buyer}</TableCell>
                  <TableCell>
                    <Badge variant={
                      sale.status === "Completed" ? "default" :
                      sale.status === "Processing" ? "secondary" : "outline"
                    }>
                      {sale.status}
                    </Badge>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
