import { useState, useEffect, useCallback } from "react";
import { createClient } from "@/lib/supabase/client";

export interface CustomerBooking {
  id: string;
  total_amount: number;
  start_date: string;
  end_date: string;
  status: string;
  cars: { name: string } | null;
}

export interface Customer {
  id: string;
  full_name: string;
  email: string;
  phone: string;
  tag: string;
  notes: string;
  created_at: string;
  bookings: CustomerBooking[];
  // Calculated fields
  initials?: string;
  total_rentals?: number;
  total_spent?: number;
  last_rental?: string;
}

export function useCustomers() {
  const [data, setData] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const supabase = createClient();

  const fetchCustomers = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      const { data: customers, error: fetchError } = await supabase
        .from('customers')
        .select(`
          *,
          bookings (
            id,
            total_amount,
            start_date,
            end_date,
            status,
            cars (name)
          )
        `)
        .order('created_at', { ascending: false });

      if (fetchError) {
        throw fetchError;
      }

      // Process calculated fields
      const processed = (customers || []).map((c: any) => {
        const bookings = c.bookings || [];
        const total_rentals = bookings.length;
        const total_spent = bookings.reduce((sum: number, b: any) => sum + (Number(b.total_amount) || 0), 0);
        
        let last_rental = "Never";
        if (bookings.length > 0) {
          // Sort bookings by start_date descending to find the latest
          const sorted = [...bookings].sort((a, b) => new Date(b.start_date).getTime() - new Date(a.start_date).getTime());
          last_rental = new Date(sorted[0].start_date).toLocaleDateString('en-US', { month: 'short', day: '2-digit', year: 'numeric' });
        }

        const initials = c.full_name
          .split(' ')
          .map((n: string) => n[0])
          .join('')
          .toUpperCase()
          .substring(0, 2);

        return {
          ...c,
          initials,
          total_rentals,
          total_spent,
          last_rental
        };
      });

      setData(processed as Customer[]);
    } catch (err: any) {
      setError(err.message || "Failed to fetch customers");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchCustomers();
  }, [fetchCustomers]);

  return { data, loading, error, refetch: fetchCustomers };
}
