import { useState, useEffect, useCallback } from "react";
import { createClient } from "@/lib/supabase/client";

export function useCustomerBookings() {
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const supabase = createClient();

  const fetchBookings = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      const { data: authData } = await supabase.auth.getUser();
      if (!authData.user) throw new Error("Not authenticated");

      const { data: bookings, error: fetchError } = await supabase
        .from('bookings')
        .select(`
          *,
          cars (name, plate_number, color, brand, year)
        `)
        .eq('customer_id', authData.user.id)
        .order('created_at', { ascending: false });

      if (fetchError) throw fetchError;

      setData(bookings || []);
    } catch (err: any) {
      setError(err.message || "Failed to fetch bookings");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchBookings();
  }, [fetchBookings]);

  return { data, loading, error, refetch: fetchBookings };
}
