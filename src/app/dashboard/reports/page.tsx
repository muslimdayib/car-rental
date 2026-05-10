"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Download, FileText } from "lucide-react";

export default function ReportsPage() {
  return (
    <div className="flex-1 space-y-6 pb-8">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Business Reports</h2>
          <p className="text-muted-foreground mt-1">Exportable analytics and detailed business performance metrics.</p>
        </div>

        {/* Date Filter Bar */}
        <div className="flex items-end gap-3 bg-muted/30 p-3 rounded-lg border w-full sm:w-auto">
          <div className="space-y-1">
            <Label className="text-xs text-muted-foreground">From Date</Label>
            <Input type="date" className="h-9 w-[140px] bg-background" defaultValue="2026-01-01" />
          </div>
          <div className="space-y-1">
            <Label className="text-xs text-muted-foreground">To Date</Label>
            <Input type="date" className="h-9 w-[140px] bg-background" defaultValue="2026-12-31" />
          </div>
          <Button className="h-9">Apply</Button>
        </div>
      </div>

      <div className="space-y-6">
        {/* Section 1: Revenue Trend */}
        <Card>
          <CardHeader className="flex flex-row items-start justify-between">
            <div>
              <CardTitle>Revenue Trend</CardTitle>
              <CardDescription className="mt-1">
                Monthly revenue growth tracking across all income streams.
              </CardDescription>
            </div>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" className="gap-2">
                <FileText className="h-4 w-4" /> Export CSV
              </Button>
              <Button variant="outline" size="sm" className="gap-2">
                <Download className="h-4 w-4" /> Export PDF
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="flex h-[350px] w-full flex-col items-center justify-center rounded-lg border-2 border-dashed border-muted-foreground/20 bg-muted/5">
              <span className="text-muted-foreground font-medium text-lg">Revenue Trend Chart Area</span>
              <span className="text-xs text-muted-foreground/60 mt-2">Placeholder for Line/Area Chart</span>
            </div>
          </CardContent>
        </Card>

        {/* Section 2: Fleet Utilization */}
        <Card>
          <CardHeader className="flex flex-row items-start justify-between">
            <div>
              <CardTitle>Fleet Utilization</CardTitle>
              <CardDescription className="mt-1">
                Percentage of time vehicles are rented versus idle or in maintenance.
              </CardDescription>
            </div>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" className="gap-2">
                <FileText className="h-4 w-4" /> Export CSV
              </Button>
              <Button variant="outline" size="sm" className="gap-2">
                <Download className="h-4 w-4" /> Export PDF
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="flex h-[350px] w-full flex-col items-center justify-center rounded-lg border-2 border-dashed border-muted-foreground/20 bg-muted/5">
              <span className="text-muted-foreground font-medium text-lg">Fleet Utilization Chart Area</span>
              <span className="text-xs text-muted-foreground/60 mt-2">Placeholder for Stacked Bar Chart</span>
            </div>
          </CardContent>
        </Card>

        {/* Section 3: Top Customers */}
        <Card>
          <CardHeader className="flex flex-row items-start justify-between">
            <div>
              <CardTitle>Top Customers</CardTitle>
              <CardDescription className="mt-1">
                Highest value clients based on total rental expenditure and volume.
              </CardDescription>
            </div>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" className="gap-2">
                <FileText className="h-4 w-4" /> Export CSV
              </Button>
              <Button variant="outline" size="sm" className="gap-2">
                <Download className="h-4 w-4" /> Export PDF
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="flex h-[350px] w-full flex-col items-center justify-center rounded-lg border-2 border-dashed border-muted-foreground/20 bg-muted/5">
              <span className="text-muted-foreground font-medium text-lg">Top Customers Chart Area</span>
              <span className="text-xs text-muted-foreground/60 mt-2">Placeholder for Horizontal Bar Chart</span>
            </div>
          </CardContent>
        </Card>

        {/* Section 4: Driver Performance */}
        <Card>
          <CardHeader className="flex flex-row items-start justify-between">
            <div>
              <CardTitle>Driver Performance</CardTitle>
              <CardDescription className="mt-1">
                Analytics on driver ratings, on-time rates, and incident frequencies.
              </CardDescription>
            </div>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" className="gap-2">
                <FileText className="h-4 w-4" /> Export CSV
              </Button>
              <Button variant="outline" size="sm" className="gap-2">
                <Download className="h-4 w-4" /> Export PDF
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="flex h-[350px] w-full flex-col items-center justify-center rounded-lg border-2 border-dashed border-muted-foreground/20 bg-muted/5">
              <span className="text-muted-foreground font-medium text-lg">Driver Performance Chart Area</span>
              <span className="text-xs text-muted-foreground/60 mt-2">Placeholder for Radar/Scatter Chart</span>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
