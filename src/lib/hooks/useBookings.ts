import { useState, useEffect, useCallback } from "react";
import { createClient } from "@/lib/supabase/client";

export interface Booking {
  id: string;
  customer_id: string;
  car_id: string;
  driver_id?: string;
  start_date: string;
  end_date: string;
  pickup_time?: string;
  return_time?: string;
  pickup_location?: string;
  return_location?: string;
  total_amount: number;
  security_deposit?: number;
  discount_amount?: number;
  amount_paid?: number;
  status: string;
  payment_status: string;
  payment_method?: string;
  booking_source?: string;
  contract_number?: string;
  terms_accepted?: boolean;
  notes?: string;
  created_at: string;
  // Joined
  customers?: { id: string; full_name: string; phone?: string; email?: string; tag?: string };
  cars?: { id: string; name: string; brand: string; model: string; plate_number: string; price_per_day: number; security_deposit?: number; image_url?: string; category?: string };
  drivers?: { id: string; full_name: string; license_number?: string };
  // Computed
  days?: number;
  isLate?: boolean;
  daysLate?: number;
}

function computeFields(b: any): Booking {
  const start = new Date(b.start_date);
  const end = new Date(b.end_date);
  const today = new Date();
  const days = Math.max(1, Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)));
  const isLate = today > end && (b.status === "Active" || b.status === "Reserved");
  const daysLate = isLate ? Math.ceil((today.getTime() - end.getTime()) / (1000 * 60 * 60 * 24)) : 0;
  return { ...b, days, isLate, daysLate };
}

export function useBookings(statusFilter = "All") {
  const [data, setData] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const supabase = createClient();

  const fetchBookings = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      let query = supabase
        .from("bookings")
        .select(`
          *,
          customers(id, full_name, phone, email, tag),
          cars(id, name, brand, model, plate_number, price_per_day, security_deposit, image_url, category),
          drivers(id, full_name, license_number)
        `)
        .order("created_at", { ascending: false });

      if (statusFilter && statusFilter !== "All") {
        query = query.eq("status", statusFilter);
      }

      const { data: bookings, error: fetchError } = await query;
      if (fetchError) throw fetchError;

      const processed = (bookings || []).map(computeFields);
      // Put late bookings first
      processed.sort((a, b) => (b.isLate ? 1 : 0) - (a.isLate ? 1 : 0));
      setData(processed);
    } catch (err: any) {
      setError(err.message || "Failed to fetch bookings");
    } finally {
      setLoading(false);
    }
  }, [statusFilter]);

  useEffect(() => { fetchBookings(); }, [fetchBookings]);

  return { data, loading, error, refetch: fetchBookings };
}
