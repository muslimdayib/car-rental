import { useState, useEffect, useCallback } from "react";
import { createClient } from "@/lib/supabase/client";

export function useDashboardStats() {
  const [stats, setStats] = useState({
    totalCars: 0,
    availableCars: 0,
    activeRentals: 0,
    inMaintenance: 0,
    todayRevenue: 0,
    monthlyRevenue: 0,
    monthlyExpenses: 0,
    netProfit: 0,
    monthlyData: [] as { name: string; revenue: number }[]
  });
  const [loading, setLoading] = useState(true);
  
  const supabase = createClient();

  const fetchStats = useCallback(async () => {
    setLoading(true);
    try {
      // 1. Total Cars
      const { count: totalCars } = await supabase.from('cars').select('*', { count: 'exact', head: true });
      
      // 2. Available Cars
      const { count: availableCars } = await supabase.from('cars').select('*', { count: 'exact', head: true }).eq('status', 'Available');
      
      // 3. Active Rentals
      const { count: activeRentals } = await supabase.from('bookings').select('*', { count: 'exact', head: true }).eq('status', 'Active');
      
      // 4. In Maintenance
      const { count: inMaintenance } = await supabase.from('maintenance').select('*', { count: 'exact', head: true }).not('status', 'eq', 'Completed');

      // Dates for filtering
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      
      const firstDayOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);

      // 5. Today Revenue
      const { data: todayBookings } = await supabase
        .from('bookings')
        .select('total_amount')
        .gte('created_at', today.toISOString());
      
      const todayRevenue = (todayBookings || []).reduce((sum, b) => sum + (Number(b.total_amount) || 0), 0);

      // 6. Monthly Revenue & Chart Data
      const { data: monthlyBookings } = await supabase
        .from('bookings')
        .select('total_amount, created_at')
        .gte('created_at', firstDayOfMonth.toISOString());
      
      const monthlyRevenue = (monthlyBookings || []).reduce((sum, b) => sum + (Number(b.total_amount) || 0), 0);

      // 7. Monthly Expenses
      const { data: monthlyMaintenance } = await supabase
        .from('maintenance')
        .select('cost')
        .gte('created_at', firstDayOfMonth.toISOString());
      
      const maintenanceCosts = (monthlyMaintenance || []).reduce((sum, m) => sum + (Number(m.cost) || 0), 0);

      const { data: monthlyFuel } = await supabase
        .from('fuel_logs')
        .select('total_cost')
        .gte('date', firstDayOfMonth.toISOString().split('T')[0]);
        
      const fuelCosts = (monthlyFuel || []).reduce((sum, f) => sum + (Number(f.total_cost) || 0), 0);
      const monthlyExpenses = maintenanceCosts + fuelCosts;

      // Generate basic chart data grouping by week or day for the current month
      // For simplicity, we'll divide the month into 4 weeks
      const chartData = [
        { name: "Week 1", revenue: 0 },
        { name: "Week 2", revenue: 0 },
        { name: "Week 3", revenue: 0 },
        { name: "Week 4", revenue: 0 },
      ];
      
      (monthlyBookings || []).forEach(b => {
        const date = new Date(b.created_at);
        const day = date.getDate();
        if (day <= 7) chartData[0].revenue += Number(b.total_amount) || 0;
        else if (day <= 14) chartData[1].revenue += Number(b.total_amount) || 0;
        else if (day <= 21) chartData[2].revenue += Number(b.total_amount) || 0;
        else chartData[3].revenue += Number(b.total_amount) || 0;
      });

      setStats({
        totalCars: totalCars || 0,
        availableCars: availableCars || 0,
        activeRentals: activeRentals || 0,
        inMaintenance: inMaintenance || 0,
        todayRevenue,
        monthlyRevenue,
        monthlyExpenses,
        netProfit: monthlyRevenue - monthlyExpenses,
        monthlyData: chartData
      });

    } catch (err) {
      console.error("Failed to fetch dashboard stats", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchStats();
  }, [fetchStats]);

  return { stats, loading, refetch: fetchStats };
}
