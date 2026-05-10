"use client";

import { useDashboardStats } from "@/lib/hooks/useDashboardStats";
import { useDashboardAlerts } from "@/lib/hooks/useDashboardAlerts";
import { useBookings } from "@/lib/hooks/useBookings";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { 
  Car, 
  CheckCircle, 
  CarFront, 
  Wrench, 
  DollarSign, 
  TrendingUp, 
  TrendingDown, 
  CircleDollarSign,
  AlertTriangle,
  AlertCircle,
  Info,
  Loader2
} from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

export default function Dashboard() {
  const { stats, loading: statsLoading } = useDashboardStats();
  const { alerts, loading: alertsLoading } = useDashboardAlerts();
  
  // Use the Bookings hook to get recent bookings for the table
  const { data: recentBookings, loading: bookingsLoading } = useBookings();
  
  const StatCard = ({ title, icon: Icon, value, loading, trend, trendLabel, positive }: any) => (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        <Icon className="h-4 w-4 text-muted-foreground" />
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="h-8 w-24 bg-muted animate-pulse rounded mt-1 mb-2"></div>
        ) : (
          <div className="text-2xl font-bold">{value}</div>
        )}
        <p className={`text-xs mt-1 flex items-center ${positive ? 'text-emerald-500' : 'text-amber-500'}`}>
          {positive ? <TrendingUp className="h-3 w-3 mr-1"/> : <TrendingDown className="h-3 w-3 mr-1"/>}
          {trend} {trendLabel && <span className="text-muted-foreground ml-1">{trendLabel}</span>}
        </p>
      </CardContent>
    </Card>
  );

  return (
    <div className="flex-1 space-y-6 pb-8">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">Dashboard</h2>
        <p className="text-muted-foreground mt-1">Overview of your car rental operations.</p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {/* Row 1 */}
        <StatCard 
          title="Total Cars" 
          icon={Car} 
          value={stats.totalCars} 
          loading={statsLoading} 
          trend="Live count" 
          positive={true} 
        />
        <StatCard 
          title="Available" 
          icon={CheckCircle} 
          value={stats.availableCars} 
          loading={statsLoading} 
          trend="Ready to rent" 
          positive={true} 
        />
        <StatCard 
          title="Active Rentals" 
          icon={CarFront} 
          value={stats.activeRentals} 
          loading={statsLoading} 
          trend="On the road" 
          positive={true} 
        />
        <StatCard 
          title="In Maintenance" 
          icon={Wrench} 
          value={stats.inMaintenance} 
          loading={statsLoading} 
          trend="Needs attention" 
          positive={false} 
        />

        {/* Row 2 */}
        <StatCard 
          title="Today Revenue" 
          icon={DollarSign} 
          value={`$${stats.todayRevenue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`} 
          loading={statsLoading} 
          trend="Today's bookings" 
          positive={true} 
        />
        <StatCard 
          title="Monthly Revenue" 
          icon={TrendingUp} 
          value={`$${stats.monthlyRevenue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`} 
          loading={statsLoading} 
          trend="Current month" 
          positive={true} 
        />
        <StatCard 
          title="Monthly Expenses" 
          icon={TrendingDown} 
          value={`$${stats.monthlyExpenses.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`} 
          loading={statsLoading} 
          trend="Current month" 
          positive={false} 
        />
        <StatCard 
          title="Net Profit" 
          icon={CircleDollarSign} 
          value={`$${stats.netProfit.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`} 
          loading={statsLoading} 
          trend="Current month" 
          positive={stats.netProfit >= 0} 
        />
      </div>

      <div className="space-y-3">
        {alertsLoading ? (
          <div className="h-14 w-full bg-muted animate-pulse rounded-lg border"></div>
        ) : alerts.length === 0 ? (
          <div className="flex items-center gap-3 rounded-lg border bg-muted/20 p-3 text-muted-foreground">
            <CheckCircle className="h-5 w-5 shrink-0" />
            <p className="text-sm font-medium">All clear! No pending alerts requiring your attention.</p>
          </div>
        ) : (
          alerts.map((alert, i) => (
            <div key={i} className={`flex items-center gap-3 rounded-lg border p-3 ${
              alert.type === 'late' ? 'border-red-500/50 bg-red-500/10 text-red-600 dark:text-red-400' :
              alert.type === 'insurance' ? 'border-amber-500/50 bg-amber-500/10 text-amber-600 dark:text-amber-400' :
              'border-blue-500/50 bg-blue-500/10 text-blue-600 dark:text-blue-400'
            }`}>
              {alert.type === 'late' ? <AlertCircle className="h-5 w-5 shrink-0" /> :
               alert.type === 'insurance' ? <AlertTriangle className="h-5 w-5 shrink-0" /> :
               <Info className="h-5 w-5 shrink-0" />}
              <p className="text-sm font-medium">{alert.message}</p>
            </div>
          ))
        )}
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
        <Card className="col-span-4">
          <CardHeader>
            <CardTitle>Revenue Trend</CardTitle>
          </CardHeader>
          <CardContent>
            {statsLoading ? (
               <div className="flex h-[300px] w-full items-center justify-center rounded-md border-2 border-dashed bg-muted/10 animate-pulse">
                <Loader2 className="h-8 w-8 text-muted-foreground animate-spin" />
               </div>
            ) : (
              <div className="h-[300px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={stats.monthlyData}>
                    <CartesianGrid strokeDasharray="3 3" opacity={0.2} vertical={false} />
                    <XAxis dataKey="name" axisLine={false} tickLine={false} />
                    <YAxis axisLine={false} tickLine={false} tickFormatter={(val) => `$${val}`} />
                    <Tooltip 
                      cursor={{fill: 'transparent'}}
                      contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                      formatter={(val: number) => [`$${val.toLocaleString()}`, "Revenue"]}
                    />
                    <Bar dataKey="revenue" fill="currentColor" className="fill-primary" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="col-span-3">
          <CardHeader>
            <CardTitle>Fleet Status</CardTitle>
          </CardHeader>
          <CardContent>
            {statsLoading ? (
               <div className="flex h-[300px] w-full items-center justify-center rounded-md border-2 border-dashed bg-muted/10 animate-pulse">
                <Loader2 className="h-8 w-8 text-muted-foreground animate-spin" />
               </div>
            ) : (
              <div className="flex flex-col h-[300px] w-full items-center justify-center space-y-6">
                <div className="flex items-center gap-4 w-full px-8">
                  <div className="h-4 w-4 rounded-full bg-emerald-500"></div>
                  <div className="flex-1 text-sm font-medium">Available</div>
                  <div className="font-bold">{stats.availableCars}</div>
                </div>
                <div className="flex items-center gap-4 w-full px-8">
                  <div className="h-4 w-4 rounded-full bg-blue-500"></div>
                  <div className="flex-1 text-sm font-medium">Active Rentals</div>
                  <div className="font-bold">{stats.activeRentals}</div>
                </div>
                <div className="flex items-center gap-4 w-full px-8">
                  <div className="h-4 w-4 rounded-full bg-amber-500"></div>
                  <div className="flex-1 text-sm font-medium">In Maintenance</div>
                  <div className="font-bold">{stats.inMaintenance}</div>
                </div>
                <div className="flex items-center gap-4 w-full px-8 pt-4 border-t border-border">
                  <div className="flex-1 text-sm font-bold text-muted-foreground">Total Fleet Size</div>
                  <div className="font-bold text-lg">{stats.totalCars}</div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Recent Bookings</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Booking ID</TableHead>
                <TableHead>Customer</TableHead>
                <TableHead>Car</TableHead>
                <TableHead>Dates</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {bookingsLoading ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <TableRow key={i} className="animate-pulse">
                    <TableCell><div className="h-4 w-20 bg-muted rounded"></div></TableCell>
                    <TableCell><div className="h-4 w-32 bg-muted rounded"></div></TableCell>
                    <TableCell><div className="h-4 w-24 bg-muted rounded"></div></TableCell>
                    <TableCell><div className="h-4 w-32 bg-muted rounded"></div></TableCell>
                    <TableCell><div className="h-6 w-16 bg-muted rounded-full"></div></TableCell>
                  </TableRow>
                ))
              ) : recentBookings.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="h-24 text-center text-muted-foreground">
                    No recent bookings found.
                  </TableCell>
                </TableRow>
              ) : (
                recentBookings.slice(0, 5).map((booking: any) => (
                  <TableRow key={booking.id}>
                    <TableCell className="font-medium">{booking.id.split('-')[0]}...</TableCell>
                    <TableCell>{booking.customers?.full_name}</TableCell>
                    <TableCell>{booking.cars?.name}</TableCell>
                    <TableCell className="text-muted-foreground">
                      {new Date(booking.start_date).toLocaleDateString()} - {new Date(booking.end_date).toLocaleDateString()}
                    </TableCell>
                    <TableCell>
                      {booking.status === "Active" ? <Badge className="bg-emerald-500 text-white">Active</Badge> :
                       booking.status === "Reserved" ? <Badge variant="secondary">Reserved</Badge> :
                       booking.status === "Completed" ? <Badge variant="outline">Completed</Badge> :
                       <Badge variant="destructive">Cancelled</Badge>}
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
