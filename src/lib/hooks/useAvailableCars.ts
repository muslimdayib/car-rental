import { useState, useEffect, useCallback } from "react";
import { createClient } from "@/lib/supabase/client";

export function useAvailableCars() {
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const supabase = createClient();

  const fetchCars = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      const { data: cars, error: fetchError } = await supabase
        .from('cars')
        .select('*')
        .eq('status', 'Available')
        .order('price_per_day', { ascending: true });

      if (fetchError) throw fetchError;

      setData(cars || []);
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
