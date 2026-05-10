"use client";

import { useState, useEffect } from "react";
import { useAvailableCars } from "@/lib/hooks/useAvailableCars";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Car, Loader2 } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";

export default function BookCarPage() {
  const { data: cars, loading: carsLoading, refetch } = useAvailableCars();
  const [selectedCar, setSelectedCar] = useState<any>(null);
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [isBooking, setIsBooking] = useState(false);
  const [user, setUser] = useState<any>(null);
  
  const supabase = createClient();
  const router = useRouter();

  useEffect(() => {
    async function loadData() {
      const { data: authData } = await supabase.auth.getUser();
      setUser(authData.user);
    }
    loadData();
  }, []);

  // Calculate days between dates
  const calculateDays = () => {
    if (!startDate || !endDate) return 0;
    const start = new Date(startDate);
    const end = new Date(endDate);
    const diffTime = Math.abs(end.getTime() - start.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays > 0 ? diffDays : 1;
  };

  const totalPrice = selectedCar ? calculateDays() * selectedCar.price_per_day : 0;

  const handleBookNow = async () => {
    if (!user || !selectedCar || !startDate || !endDate) return;
    setIsBooking(true);

    try {
      // Insert Booking
      const { error: bookingError } = await supabase.from('bookings').insert({
        customer_id: user.id,
        car_id: selectedCar.id,
        start_date: startDate,
        end_date: endDate,
        total_amount: totalPrice,
        status: 'Reserved',
        payment_status: 'Pending',
      });

      if (bookingError) throw bookingError;

      // Update Car Status
      const { error: carError } = await supabase.from('cars').update({ status: 'Rented' }).eq('id', selectedCar.id);
      
      if (carError) throw carError;

      setSelectedCar(null);
      
      // We don't really need to refetch because we're redirecting, but it's good practice
      refetch();
      
      alert("Booking confirmed successfully!");
      router.push('/customer/bookings');
      
    } catch (err: any) {
      alert("Error booking car: " + (err.message || "Unknown error"));
    } finally {
      setIsBooking(false);
    }
  };

  if (carsLoading) return <div className="flex justify-center p-12"><Loader2 className="h-8 w-8 animate-spin" /></div>;

  return (
    <div className="space-y-6 pb-8">
      <h1 className="text-3xl font-bold tracking-tight">Book a Car</h1>
      <p className="text-muted-foreground">Select an available vehicle for your next trip.</p>
      
      {cars.length === 0 ? (
        <Card><CardContent className="p-12 text-center text-muted-foreground">No cars currently available.</CardContent></Card>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {cars.map((car) => (
            <Card key={car.id}>
              <CardHeader>
                <div className="w-full h-32 bg-muted rounded-md flex items-center justify-center mb-4 overflow-hidden relative">
                  {car.image_url ? (
                    <img src={car.image_url} alt={car.name} className="object-cover w-full h-full" />
                  ) : (
                    <Car className="h-10 w-10 text-muted-foreground/50" />
                  )}
                </div>
                <div className="flex justify-between items-start">
                  <CardTitle className="text-xl">{car.name}</CardTitle>
                </div>
                <p className="text-sm text-muted-foreground">{car.brand} • {car.year} • {car.plate_number}</p>
              </CardHeader>
              <CardContent>
                <p className="text-2xl font-bold">${car.price_per_day}<span className="text-sm text-muted-foreground font-normal">/day</span></p>
              </CardContent>
              <CardFooter>
                <Button className="w-full" onClick={() => setSelectedCar(car)}>Book Now</Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      )}

      {/* Booking Modal */}
      <Dialog open={!!selectedCar} onOpenChange={(open) => !open && setSelectedCar(null)}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Reserve Vehicle</DialogTitle>
            <DialogDescription>
              Select your dates to book the {selectedCar?.name}.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="start">Start Date</Label>
                <Input 
                  id="start" 
                  type="date" 
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  min={new Date().toISOString().split('T')[0]}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="end">End Date</Label>
                <Input 
                  id="end" 
                  type="date" 
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  min={startDate || new Date().toISOString().split('T')[0]}
                />
              </div>
            </div>
            
            {startDate && endDate && (
              <div className="mt-4 p-4 bg-muted rounded-lg flex justify-between items-center">
                <div>
                  <p className="font-medium text-sm text-muted-foreground">Total Price</p>
                  <p className="text-xs text-muted-foreground">{calculateDays()} days × ${selectedCar?.price_per_day}</p>
                </div>
                <p className="text-2xl font-bold text-primary">${totalPrice}</p>
              </div>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setSelectedCar(null)} disabled={isBooking}>Cancel</Button>
            <Button onClick={handleBookNow} disabled={!startDate || !endDate || isBooking}>
              {isBooking ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
              Confirm Booking
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
