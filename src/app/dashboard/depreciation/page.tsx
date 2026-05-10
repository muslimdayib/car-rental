"use client";

import { useDepreciation } from "@/lib/hooks/useDepreciation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { DollarSign, TrendingDown, Percent, Car, Loader2, AlertCircle } from "lucide-react";

export default function DepreciationPage() {
  const { data: cars, stats, loading, error } = useDepreciation();

  return (
    <div className="flex-1 space-y-6 pb-8">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">Fleet Depreciation</h2>
        <p className="text-muted-foreground mt-1">Track asset values, accumulated depreciation, and book values based on real fleet data.</p>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Total Fleet Value</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="h-8 w-32 bg-muted animate-pulse rounded mt-1"></div>
            ) : (
              <div className="text-2xl font-bold">${stats.totalFleetValue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</div>
            )}
            <p className="text-xs text-muted-foreground mt-1">Current total book value</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Total Depreciation</CardTitle>
            <TrendingDown className="h-4 w-4 text-red-500" />
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="h-8 w-32 bg-muted animate-pulse rounded mt-1"></div>
            ) : (
              <div className="text-2xl font-bold text-red-500">-${stats.totalDepreciation.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</div>
            )}
            <p className="text-xs text-muted-foreground mt-1">Accumulated loss in value</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Average Remaining Value</CardTitle>
            <Percent className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
             {loading ? (
              <div className="h-8 w-20 bg-muted animate-pulse rounded mt-1"></div>
            ) : (
              <div className="text-2xl font-bold">{stats.averageRemainingPct}%</div>
            )}
            <p className="text-xs text-muted-foreground mt-1">Across all active vehicles</p>
          </CardContent>
        </Card>
      </div>

      {error && (
        <div className="bg-destructive/10 text-destructive p-4 rounded-lg flex items-center gap-2">
          <AlertCircle className="h-5 w-5" />
          {error}
        </div>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Asset Depreciation Schedule</CardTitle>
        </CardHeader>
        <CardContent className="p-0 sm:p-6">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Car Name</TableHead>
                  <TableHead>Purchase Price</TableHead>
                  <TableHead>Purchase Year</TableHead>
                  <TableHead>Current Book Value</TableHead>
                  <TableHead>Method</TableHead>
                  <TableHead>Annual Rate %</TableHead>
                  <TableHead>Accumulated Depreciation</TableHead>
                  <TableHead className="min-w-[150px] w-[200px]">Remaining Value %</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  Array.from({ length: 5 }).map((_, i) => (
                    <TableRow key={i} className="animate-pulse">
                      <TableCell><div className="h-4 w-32 bg-muted rounded"></div></TableCell>
                      <TableCell><div className="h-4 w-20 bg-muted rounded"></div></TableCell>
                      <TableCell><div className="h-4 w-16 bg-muted rounded"></div></TableCell>
                      <TableCell><div className="h-4 w-24 bg-muted rounded"></div></TableCell>
                      <TableCell><div className="h-5 w-24 bg-muted rounded-full"></div></TableCell>
                      <TableCell><div className="h-4 w-12 bg-muted rounded"></div></TableCell>
                      <TableCell><div className="h-4 w-24 bg-muted rounded"></div></TableCell>
                      <TableCell><div className="h-4 w-full bg-muted rounded"></div></TableCell>
                    </TableRow>
                  ))
                ) : cars.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={8} className="h-32 text-center text-muted-foreground">
                      No cars with purchase data found. Make sure to add cars with a Purchase Price to track depreciation.
                    </TableCell>
                  </TableRow>
                ) : (
                  cars.map((car) => (
                    <TableRow key={car.id} className="hover:bg-muted/50 transition-colors">
                      <TableCell className="font-medium flex items-center gap-2 whitespace-nowrap">
                        <Car className="h-4 w-4 text-muted-foreground" />
                        {car.name}
                      </TableCell>
                      <TableCell>${car.purchase_price.toLocaleString()}</TableCell>
                      <TableCell>{car.year}</TableCell>
                      <TableCell className="font-semibold text-primary">${car.current_book_value.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</TableCell>
                      <TableCell>
                        <Badge variant="outline" className="font-normal text-xs bg-muted/50">
                          Straight-Line
                        </Badge>
                      </TableCell>
                      <TableCell>{car.depreciation_rate}%</TableCell>
                      <TableCell className="text-red-500 font-medium">-${car.total_depreciation.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <div className="w-full h-2 bg-muted rounded-full overflow-hidden">
                            <div 
                              className={`h-full rounded-full transition-all duration-500 ${
                                car.remaining_pct > 70 ? "bg-emerald-500" : 
                                car.remaining_pct > 45 ? "bg-amber-500" : "bg-red-500"
                              }`} 
                              style={{ width: `${car.remaining_pct}%` }}
                            />
                          </div>
                          <span className="text-xs font-medium w-8 text-right">{car.remaining_pct}%</span>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
