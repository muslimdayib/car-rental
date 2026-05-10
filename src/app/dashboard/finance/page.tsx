"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { DollarSign, TrendingUp, TrendingDown, Percent, CreditCard, ArrowUpRight, ArrowDownRight } from "lucide-react";

const HARDCODED_EXPENSES = [
  { category: "Vehicle Purchases & Leasing", amount: "$125,000", pct: 45 },
  { category: "Maintenance & Repairs", amount: "$42,500", pct: 15 },
  { category: "Insurance Premiums", amount: "$38,000", pct: 14 },
  { category: "Payroll & Benefits", amount: "$45,200", pct: 16 },
  { category: "Fuel Costs", amount: "$18,500", pct: 7 },
  { category: "Software & Admin", amount: "$8,300", pct: 3 },
];

const HARDCODED_TRANSACTIONS = [
  { id: "TRX-901", date: "May 03, 2026", description: "Booking BKG-9004 Payment", category: "Rental Revenue", amount: "+$360.00", type: "income" },
  { id: "TRX-902", date: "May 03, 2026", description: "SafeDrive Auto Premium Q2", category: "Insurance", amount: "-$4,250.00", type: "expense" },
  { id: "TRX-903", date: "May 02, 2026", description: "Maintenance Vendor Payout", category: "Repairs", amount: "-$850.00", type: "expense" },
  { id: "TRX-904", date: "May 02, 2026", description: "Booking BKG-9001 Payment", category: "Rental Revenue", amount: "+$340.00", type: "income" },
  { id: "TRX-905", date: "May 01, 2026", description: "Corporate Account Retainer", category: "B2B Revenue", amount: "+$5,000.00", type: "income" },
  { id: "TRX-906", date: "May 01, 2026", description: "Shell Fleet Fuel Card", category: "Fuel", amount: "-$1,240.00", type: "expense" },
  { id: "TRX-907", date: "Apr 30, 2026", description: "Staff Payroll - April", category: "Payroll", amount: "-$22,500.00", type: "expense" },
  { id: "TRX-908", date: "Apr 28, 2026", description: "Booking BKG-9003 Payment", category: "Rental Revenue", amount: "+$180.00", type: "income" },
];

export default function FinancePage() {
  return (
    <div className="flex-1 space-y-6 pb-8">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">Financial Overview</h2>
        <p className="text-muted-foreground mt-1">Monitor revenue streams, expenses, and overall business profitability.</p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
            <DollarSign className="h-4 w-4 text-emerald-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">$485,200</div>
            <p className="text-xs text-emerald-500 mt-1 flex items-center"><TrendingUp className="h-3 w-3 mr-1" /> +14.5% vs last year</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Total Expenses</CardTitle>
            <CreditCard className="h-4 w-4 text-red-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">$277,500</div>
            <p className="text-xs text-red-500 mt-1 flex items-center"><TrendingUp className="h-3 w-3 mr-1" /> +5.2% vs last year</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Net Profit</CardTitle>
            <TrendingUp className="h-4 w-4 text-emerald-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-emerald-500">$207,700</div>
            <p className="text-xs text-emerald-500 mt-1 flex items-center"><TrendingUp className="h-3 w-3 mr-1" /> +22.4% vs last year</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Profit Margin</CardTitle>
            <Percent className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">42.8%</div>
            <p className="text-xs text-emerald-500 mt-1 flex items-center"><TrendingUp className="h-3 w-3 mr-1" /> +2.1% from last month</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardContent className="p-6">
            <div className="flex h-[300px] w-full flex-col items-center justify-center rounded-lg border-2 border-dashed border-muted-foreground/20 bg-muted/10">
              <span className="text-muted-foreground font-medium text-lg">Income vs Expenses (12 months bar chart)</span>
              <span className="text-xs text-muted-foreground/60 mt-2">Chart Placeholder</span>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex h-[300px] w-full flex-col items-center justify-center rounded-lg border-2 border-dashed border-muted-foreground/20 bg-muted/10">
              <span className="text-muted-foreground font-medium text-lg">Revenue Breakdown (donut chart)</span>
              <span className="text-xs text-muted-foreground/60 mt-2">Chart Placeholder</span>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-[1fr_2fr]">
        <Card>
          <CardHeader>
            <CardTitle>Expense Breakdown</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Category</TableHead>
                  <TableHead className="text-right">Amount</TableHead>
                  <TableHead className="w-[100px]">Share</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {HARDCODED_EXPENSES.map((exp, idx) => (
                  <TableRow key={idx} className="hover:bg-muted/50 transition-colors">
                    <TableCell className="font-medium text-sm">{exp.category}</TableCell>
                    <TableCell className="text-right">{exp.amount}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <span className="text-xs w-8 text-right font-medium">{exp.pct}%</span>
                        <div className="w-16 h-1.5 bg-muted rounded-full overflow-hidden">
                          <div className="h-full bg-red-400 rounded-full" style={{ width: `${exp.pct}%` }} />
                        </div>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Recent Transactions</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Date</TableHead>
                  <TableHead>Description</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead className="text-right">Amount</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {HARDCODED_TRANSACTIONS.map((trx) => (
                  <TableRow key={trx.id} className="hover:bg-muted/50 transition-colors">
                    <TableCell className="text-muted-foreground whitespace-nowrap">{trx.date}</TableCell>
                    <TableCell className="font-medium">{trx.description}</TableCell>
                    <TableCell>
                      <Badge variant="outline" className="font-normal">{trx.category}</Badge>
                    </TableCell>
                    <TableCell className={`text-right font-bold flex items-center justify-end gap-1 ${trx.type === "income" ? "text-emerald-500" : "text-red-500"}`}>
                      {trx.type === "income" ? <ArrowUpRight className="h-3 w-3" /> : <ArrowDownRight className="h-3 w-3" />}
                      {trx.amount}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
