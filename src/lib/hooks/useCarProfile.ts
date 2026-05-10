"use client";

import { useState, useEffect, useCallback } from "react";
import { createClient } from "@/lib/supabase/client";

export interface CarProfile {
  car: any;
  bookings: any[];
  maintenance: any[];
  fuelLogs: any[];
  insurance: any[];
  claims: any[];
  totalRevenue: number;
  totalMaintenanceCost: number;
  totalFuelCost: number;
  netProfit: number;
  utilizationRate: number;
  loading: boolean;
  error: string | null;
}

export function useCarProfile(carId: string | null) {
  const [profile, setProfile] = useState<CarProfile>({
    car: null,
    bookings: [],
    maintenance: [],
    fuelLogs: [],
    insurance: [],
    claims: [],
    totalRevenue: 0,
    totalMaintenanceCost: 0,
    totalFuelCost: 0,
    netProfit: 0,
    utilizationRate: 0,
    loading: false,
    error: null,
  });

  const supabase = createClient();

  const fetchProfile = useCallback(async () => {
    if (!carId) return;
    setProfile((p) => ({ ...p, loading: true, error: null }));

    try {
      const [carRes, bookingsRes, maintenanceRes, fuelRes, insuranceRes, claimsRes] =
        await Promise.all([
          supabase.from("cars").select("*").eq("id", carId).single(),
          supabase
            .from("bookings")
            .select("*, customers(full_name)")
            .eq("car_id", carId)
            .order("created_at", { ascending: false }),
          supabase
            .from("maintenance")
            .select("*, employees(full_name)")
            .eq("car_id", carId)
            .order("created_at", { ascending: false }),
          supabase
            .from("fuel_logs")
            .select("*, drivers(full_name)")
            .eq("car_id", carId)
            .order("date", { ascending: false }),
          supabase
            .from("insurance_policies")
            .select("*")
            .eq("car_id", carId)
            .order("created_at", { ascending: false }),
          supabase
            .from("claims")
            .select("*")
            .eq("car_id", carId)
            .order("created_at", { ascending: false }),
        ]);

      const bookings = bookingsRes.data || [];
      const maintenance = maintenanceRes.data || [];
      const fuelLogs = fuelRes.data || [];

      const totalRevenue = bookings
        .filter((b: any) => b.status === "Completed")
        .reduce((sum: number, b: any) => sum + Number(b.total_amount || 0), 0);

      const totalMaintenanceCost = maintenance.reduce(
        (sum: number, m: any) => sum + Number(m.cost || 0),
        0
      );

      const totalFuelCost = fuelLogs.reduce(
        (sum: number, f: any) => sum + Number(f.total_cost || 0),
        0
      );

      const netProfit = totalRevenue - totalMaintenanceCost - totalFuelCost;

      // Utilization: completed booking days / days since purchase
      const car = carRes.data;
      let utilizationRate = 0;
      if (car?.purchase_date) {
        const purchaseDate = new Date(car.purchase_date);
        const today = new Date();
        const totalDays = Math.max(
          1,
          Math.floor((today.getTime() - purchaseDate.getTime()) / (1000 * 60 * 60 * 24))
        );
        const rentedDays = bookings
          .filter((b: any) => b.status === "Completed")
          .reduce((sum: number, b: any) => {
            const start = new Date(b.start_date);
            const end = new Date(b.end_date);
            return (
              sum +
              Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24))
            );
          }, 0);
        utilizationRate = Math.round((rentedDays / totalDays) * 100);
      }

      setProfile({
        car,
        bookings,
        maintenance,
        fuelLogs,
        insurance: insuranceRes.data || [],
        claims: claimsRes.data || [],
        totalRevenue,
        totalMaintenanceCost,
        totalFuelCost,
        netProfit,
        utilizationRate,
        loading: false,
        error: null,
      });
    } catch (err: any) {
      setProfile((p) => ({ ...p, loading: false, error: err.message }));
    }
  }, [carId]);

  useEffect(() => {
    fetchProfile();
  }, [fetchProfile]);

  return { ...profile, refetch: fetchProfile };
}
