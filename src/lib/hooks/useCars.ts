import { useState, useEffect, useCallback } from "react";
import { createClient } from "@/lib/supabase/client";

export interface CarAlert {
  type: "error" | "warning" | "info";
  message: string;
}

export interface Car {
  id: string;
  name: string;
  brand: string;
  model: string;
  year: number;
  color: string;
  body_type: string;
  seats: number;
  fuel_type: string;
  engine_size: string;
  transmission: string;
  drive_type: string;
  condition: string;
  notes: string;
  plate_number: string;
  chassis_number: string;
  engine_number: string;
  gps_tracker_id: string;
  registration_number: string;
  registration_date: string;
  registration_expiry: string;
  road_tax_expiry: string;
  fitness_certificate_expiry: string;
  previous_owners: number;
  accident_history: boolean;
  purchase_price: number;
  purchase_date: string;
  depreciation_rate: number;
  price_per_day: number;
  price_per_week: number;
  price_per_month: number;
  security_deposit: number;
  min_rental_age: number;
  mileage: number;
  status: string;
  image_url: string;
  created_at: string;
  // Computed
  alerts: CarAlert[];
  current_book_value: number;
}

function computeAlerts(car: any, insuranceExpiry: string | null): CarAlert[] {
  const alerts: CarAlert[] = [];
  const today = new Date();
  const in30Days = new Date();
  in30Days.setDate(today.getDate() + 30);

  const check = (dateStr: string | null, label: string) => {
    if (!dateStr) return;
    const d = new Date(dateStr);
    if (d < today) {
      alerts.push({ type: "error", message: `${label} EXPIRED` });
    } else if (d <= in30Days) {
      alerts.push({ type: "warning", message: `${label} expiring soon` });
    }
  };

  check(car.registration_expiry, "Registration");
  check(car.road_tax_expiry, "Road tax");
  check(insuranceExpiry, "Insurance");

  if (!insuranceExpiry) {
    alerts.push({ type: "warning", message: "No insurance linked" });
  }

  return alerts;
}

function computeBookValue(car: any): number {
  if (!car.purchase_price || !car.depreciation_rate) return car.purchase_price || 0;
  const currentYear = new Date().getFullYear();
  const carYear = Number(car.year) || currentYear;
  const years = Math.max(0, currentYear - carYear);
  const rate = Number(car.depreciation_rate) / 100;
  const totalDepreciation = Number(car.purchase_price) * rate * years;
  return Math.max(0, Number(car.purchase_price) - totalDepreciation);
}

export function useCars() {
  const [data, setData] = useState<Car[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const supabase = createClient();

  const fetchCars = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const [carsRes, insuranceRes] = await Promise.all([
        supabase.from("cars").select("*").order("created_at", { ascending: false }),
        supabase
          .from("insurance_policies")
          .select("car_id, end_date, status")
          .eq("status", "Active"),
      ]);

      if (carsRes.error) throw carsRes.error;

      // Build a map of car_id -> nearest insurance end_date
      const insuranceMap: Record<string, string> = {};
      for (const policy of insuranceRes.data || []) {
        if (!insuranceMap[policy.car_id] || policy.end_date < insuranceMap[policy.car_id]) {
          insuranceMap[policy.car_id] = policy.end_date;
        }
      }

      const processed: Car[] = (carsRes.data || []).map((car: any) => ({
        ...car,
        alerts: computeAlerts(car, insuranceMap[car.id] ?? null),
        current_book_value: computeBookValue(car),
      }));

      setData(processed);
    } catch (err: any) {
      setError(err.message || "Failed to fetch cars");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchCars();
  }, [fetchCars]);

  return { data, loading, error, refetch: fetchCars };
}
