import { useState, useEffect, useCallback } from "react";
import { createClient } from "@/lib/supabase/client";

export function useDashboardAlerts() {
  const [alerts, setAlerts] = useState<{ type: string; message: string; date?: string }[]>([]);
  const [loading, setLoading] = useState(true);
  
  const supabase = createClient();

  const fetchAlerts = useCallback(async () => {
    setLoading(true);
    try {
      const today = new Date();
      today.setHours(0,0,0,0);
      
      const twoWeeksFromNow = new Date(today);
      twoWeeksFromNow.setDate(twoWeeksFromNow.getDate() + 14);

      const newAlerts = [];

      // 1. Late Returns
      const { data: lateBookings } = await supabase
        .from('bookings')
        .select(`
          id,
          end_date,
          customers (full_name),
          cars (name, plate_number)
        `)
        .eq('status', 'Active')
        .lt('end_date', today.toISOString().split('T')[0]);

      if (lateBookings && lateBookings.length > 0) {
        lateBookings.forEach((b: any) => {
          newAlerts.push({
            type: 'late',
            message: `Late Return - ${b.cars?.name} (${b.cars?.plate_number}) is overdue since ${b.end_date}. Customer: ${b.customers?.full_name}`
          });
        });
      }

      // 2. Expiring Insurance
      const { data: expiringPolicies } = await supabase
        .from('insurance_policies')
        .select(`
          end_date,
          cars (name, plate_number)
        `)
        .gte('end_date', today.toISOString().split('T')[0])
        .lte('end_date', twoWeeksFromNow.toISOString().split('T')[0]);

      if (expiringPolicies && expiringPolicies.length > 0) {
        expiringPolicies.forEach((p: any) => {
          newAlerts.push({
            type: 'insurance',
            message: `Insurance Expiry - ${p.cars?.name} (${p.cars?.plate_number}) policy expires on ${p.end_date}.`
          });
        });
      }

      // 3. Maintenance Due
      const { data: maintenanceOpen } = await supabase
        .from('maintenance')
        .select(`
          issue,
          cars (name, plate_number)
        `)
        .in('status', ['Open', 'Scheduled']);

      if (maintenanceOpen && maintenanceOpen.length > 0) {
        maintenanceOpen.forEach((m: any) => {
          newAlerts.push({
            type: 'maintenance',
            message: `Maintenance Due - ${m.cars?.name} (${m.cars?.plate_number}) is scheduled for: ${m.issue}.`
          });
        });
      }

      setAlerts(newAlerts as any);
    } catch (err) {
      console.error("Failed to fetch alerts", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAlerts();
  }, [fetchAlerts]);

  return { alerts, loading, refetch: fetchAlerts };
}
