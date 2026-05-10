import { useState, useEffect, useCallback } from "react";
import { createClient } from "@/lib/supabase/client";

export interface DepreciationRecord {
  id: string;
  name: string;
  brand: string;
  model: string;
  year: number;
  purchase_price: number;
  depreciation_rate: number;
  // Calculated fields
  years_owned: number;
  annual_depreciation: number;
  total_depreciation: number;
  current_book_value: number;
  remaining_pct: number;
}

export function useDepreciation() {
  const [data, setData] = useState<DepreciationRecord[]>([]);
  const [stats, setStats] = useState({
    totalFleetValue: 0,
    totalDepreciation: 0,
    averageRemainingPct: 0
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const supabase = createClient();

  const fetchDepreciation = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      const { data: cars, error: fetchError } = await supabase
        .from('cars')
        .select('id, name, brand, model, year, purchase_price, depreciation_rate')
        .not('purchase_price', 'is', null)
        .order('created_at', { ascending: false });

      if (fetchError) throw fetchError;

      const currentYear = new Date().getFullYear();
      let sumCurrentValue = 0;
      let sumDepreciation = 0;
      let sumRemainingPct = 0;
      let count = 0;

      const processed = (cars || []).map((car: any) => {
        const pPrice = Number(car.purchase_price) || 0;
        const dRate = (Number(car.depreciation_rate) || 0) / 100; // e.g., 20% -> 0.20
        const carYear = Number(car.year) || currentYear;
        
        let yearsOwned = currentYear - carYear;
        if (yearsOwned < 0) yearsOwned = 0;
        
        const annualDepreciation = pPrice * dRate;
        let totalDepreciation = annualDepreciation * yearsOwned;
        
        // Cap depreciation so value doesn't go below 0
        if (totalDepreciation > pPrice) {
          totalDepreciation = pPrice;
        }

        const currentBookValue = pPrice - totalDepreciation;
        let remainingPct = 0;
        if (pPrice > 0) {
          remainingPct = Math.round((currentBookValue / pPrice) * 100);
        }

        // Aggregate
        sumCurrentValue += currentBookValue;
        sumDepreciation += totalDepreciation;
        if (pPrice > 0) {
          sumRemainingPct += remainingPct;
          count++;
        }

        return {
          id: car.id,
          name: car.name || `${car.brand} ${car.model}`,
          brand: car.brand,
          model: car.model,
          year: carYear,
          purchase_price: pPrice,
          depreciation_rate: Number(car.depreciation_rate) || 0,
          years_owned: yearsOwned,
          annual_depreciation: annualDepreciation,
          total_depreciation: totalDepreciation,
          current_book_value: currentBookValue,
          remaining_pct: remainingPct
        };
      });

      setData(processed);
      setStats({
        totalFleetValue: sumCurrentValue,
        totalDepreciation: sumDepreciation,
        averageRemainingPct: count > 0 ? Math.round(sumRemainingPct / count) : 0
      });

    } catch (err: any) {
      setError(err.message || "Failed to calculate depreciation");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchDepreciation();
  }, [fetchDepreciation]);

  return { data, stats, loading, error, refetch: fetchDepreciation };
}
