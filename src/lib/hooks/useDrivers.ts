import { useState, useEffect, useCallback } from "react";
import { createClient } from "@/lib/supabase/client";

export interface Driver {
  id: string;
  full_name: string;
  phone: string;
  nationality?: string;
  date_of_birth?: string;
  gender?: string;
  address?: string;
  city?: string;
  photo_url?: string;
  // Identity
  id_type?: string;
  id_number?: string;
  id_expiry?: string;
  emergency_contact?: string;
  // License
  license_number?: string;
  license_type?: string;
  license_expiry?: string;
  license_issue_date?: string;
  license_issuing_country?: string;
  years_experience?: number;
  // Risk
  bg_check_status?: string;
  bg_check_date?: string;
  bg_check_notes?: string;
  previous_accidents?: boolean;
  accident_notes?: string;
  blacklisted?: boolean;
  blacklist_reason?: string;
  blacklisted_by?: string;
  blacklisted_at?: string;
  status?: string;
  rating?: number;
  risk_score?: number;
  notes?: string;
  created_at: string;
  // Computed
  computed_risk_score: number;
  risk_label: string;
  risk_color: string;
  license_expired: boolean;
  license_expiring_soon: boolean;
  total_rentals: number;
  age?: number;
}

/** BUG 1 FIX — Correct age calculation accounting for month/day */
export function calculateAge(dateOfBirth: string): number {
  const today = new Date();
  const birthDate = new Date(dateOfBirth);
  let age = today.getFullYear() - birthDate.getFullYear();
  const monthDiff = today.getMonth() - birthDate.getMonth();
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
    age--;
  }
  return age;
}

/** BUG 3 FIX — Uses correct column name `previous_accidents`, wrapped in try/catch */
export function computeRiskScore(driver: any): number {
  try {
    if (driver.blacklisted === true) return 0;
    let score = 100;
    const today = new Date();
    // Expired license
    if (driver.license_expiry && new Date(driver.license_expiry) < today) score -= 50;
    // Previous accidents (correct column name)
    if (driver.previous_accidents === true) score -= 20;
    // Incidents from risk_score already stored, or use 0
    return Math.max(0, score);
  } catch {
    return 100; // safe default if anything goes wrong
  }
}

export function riskLabel(score: number): { label: string; color: string; bg: string; message: string } {
  if (score >= 80) return { label: "LOW RISK",       color: "text-emerald-600", bg: "bg-emerald-50 border-emerald-200", message: "Safe to rent" };
  if (score >= 60) return { label: "MEDIUM RISK",    color: "text-amber-600",   bg: "bg-amber-50 border-amber-200",   message: "Rent with extra deposit" };
  if (score >= 40) return { label: "HIGH RISK",      color: "text-orange-600",  bg: "bg-orange-50 border-orange-200", message: "Manager approval needed" };
  return             { label: "VERY HIGH RISK",   color: "text-red-600",     bg: "bg-red-50 border-red-200",       message: "Deny rental" };
}

/** BUG 2 FIX — statusBadge reads from `status` column (lowercase values from DB) */
export function statusDisplay(status?: string): { label: string; cls: string } {
  switch ((status || "").toLowerCase()) {
    case "active":      return { label: "Active",      cls: "bg-emerald-500 text-white" };
    case "approved":    return { label: "Approved",    cls: "bg-emerald-500 text-white" };
    case "pending":     return { label: "Pending",     cls: "bg-amber-500 text-white" };
    case "suspended":   return { label: "Suspended",   cls: "bg-red-500 text-white" };
    case "blacklisted": return { label: "Blacklisted", cls: "bg-gray-900 text-white" };
    case "off_duty":    return { label: "Off Duty",    cls: "bg-gray-400 text-white" };
    case "flagged":     return { label: "Flagged",     cls: "bg-orange-500 text-white" };
    default:            return { label: status || "Unknown", cls: "bg-muted text-muted-foreground" };
  }
}

function processDriver(d: any, rentalCount = 0): Driver {
  const today = new Date();
  const in30 = new Date(); in30.setDate(today.getDate() + 30);
  const licExp = d.license_expiry ? new Date(d.license_expiry) : null;
  const license_expired = licExp ? licExp < today : false;
  const license_expiring_soon = licExp ? (licExp >= today && licExp <= in30) : false;

  const computed_risk_score = computeRiskScore(d);
  const { label, color } = riskLabel(computed_risk_score);
  const age = d.date_of_birth ? calculateAge(d.date_of_birth) : undefined;

  return {
    ...d,
    computed_risk_score,
    risk_label: label,
    risk_color: color,
    license_expired,
    license_expiring_soon,
    total_rentals: rentalCount,
    age,
  };
}

export function useDrivers() {
  const [data, setData] = useState<Driver[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const supabase = createClient();

  const fetchDrivers = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const { data: drivers, error: e } = await supabase
        .from("drivers")
        .select("*")
        .order("created_at", { ascending: false });
      if (e) throw e;

      // Rental counts per driver
      const { data: counts } = await supabase
        .from("bookings")
        .select("driver_id")
        .not("driver_id", "is", null);

      const countMap: Record<string, number> = {};
      for (const b of counts || []) {
        if (b.driver_id) countMap[b.driver_id] = (countMap[b.driver_id] || 0) + 1;
      }

      const processed = (drivers || []).map((d) =>
        processDriver(d, countMap[d.id] || 0)
      );
      setData(processed);
    } catch (err: any) {
      setError(err.message || "Failed to fetch drivers");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchDrivers(); }, [fetchDrivers]);
  return { data, loading, error, refetch: fetchDrivers };
}
