"use client";

import { useState, useMemo } from "react";
import { useCustomers, Customer } from "@/lib/hooks/useCustomers";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Search, Plus, Eye, Phone, Mail, CreditCard, Car as CarIcon, Loader2, AlertCircle } from "lucide-react";

export default function CustomersPage() {
  const { data: customers, loading, error: fetchError, refetch } = useCustomers();
  
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  
  const [isSaving, setIsSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    full_name: "",
    phone: "",
    email: "",
    tag: "New",
    notes: ""
  });

  const supabase = createClient();

  const handleSaveCustomer = async () => {
    setIsSaving(true);
    setSaveError(null);

    try {
      if (!formData.full_name) {
        throw new Error("Full Name is required.");
      }

      const { error } = await supabase.from('customers').insert([{
        full_name: formData.full_name,
        phone: formData.phone,
        email: formData.email,
        tag: formData.tag,
        notes: formData.notes
      }]);

      if (error) throw error;

      setFormData({
        full_name: "",
        phone: "",
        email: "",
        tag: "New",
        notes: ""
      });
      setIsAddModalOpen(false);
      refetch();
    } catch (err: any) {
      setSaveError(err.message || "Failed to save customer");
    } finally {
      setIsSaving(false);
    }
  };

  const getTagBadge = (tag: string) => {
    switch (tag) {
      case "VIP": return <Badge className="bg-purple-500 hover:bg-purple-600">VIP</Badge>;
      case "Returning": return <Badge className="bg-blue-500 hover:bg-blue-600">Returning</Badge>;
      case "New": return <Badge className="bg-emerald-500 hover:bg-emerald-600">New</Badge>;
      default: return <Badge>{tag}</Badge>;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "Active": return <Badge className="bg-emerald-500 text-white">Active</Badge>;
      case "Completed": return <Badge variant="outline">Completed</Badge>;
      case "Reserved": return <Badge variant="secondary">Reserved</Badge>;
      case "Cancelled": return <Badge variant="destructive">Cancelled</Badge>;
      default: return <Badge>{status}</Badge>;
    }
  };

  const filteredCustomers = useMemo(() => {
    const q = searchQuery.toLowerCase();
    return customers.filter(c => 
      c.full_name.toLowerCase().includes(q) || 
      (c.phone && c.phone.toLowerCase().includes(q))
    );
  }, [customers, searchQuery]);

  // Helper to format date
  const formatDate = (dateStr: string) => new Date(dateStr).toLocaleDateString('en-US', { month: 'short', day: '2-digit', year: 'numeric' });

  return (
    <div className="flex-1 space-y-6 pb-8">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Customers</h2>
          <p className="text-muted-foreground mt-1">Manage client profiles, rental history, and VIP status.</p>
        </div>

        <div className="flex items-center gap-4 w-full sm:w-auto">
          <div className="relative w-full sm:w-[300px]">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input 
              placeholder="Search by name or phone..." 
              className="pl-8 bg-background" 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          <Dialog open={isAddModalOpen} onOpenChange={setIsAddModalOpen}>
            <DialogTrigger>
              <Button className="shrink-0 gap-2" onClick={() => setSaveError(null)}>
                <Plus className="h-4 w-4" />
                Add Customer
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[500px]">
              <DialogHeader>
                <DialogTitle>Add New Customer</DialogTitle>
                <DialogDescription>
                  Create a new customer profile for reservations.
                </DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="space-y-2">
                  <Label>Full Name</Label>
                  <Input 
                    placeholder="e.g. John Smith" 
                    value={formData.full_name}
                    onChange={(e) => setFormData({...formData, full_name: e.target.value})}
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Phone Number</Label>
                    <Input 
                      placeholder="+1 555-0000" 
                      value={formData.phone}
                      onChange={(e) => setFormData({...formData, phone: e.target.value})}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Email Address</Label>
                    <Input 
                      placeholder="john@example.com" 
                      type="email" 
                      value={formData.email}
                      onChange={(e) => setFormData({...formData, email: e.target.value})}
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>Status Tag</Label>
                  <Select value={formData.tag} onValueChange={(val) => setFormData({...formData, tag: val})}>
                    <SelectTrigger><SelectValue placeholder="Select Tag" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="New">New</SelectItem>
                      <SelectItem value="Returning">Returning</SelectItem>
                      <SelectItem value="VIP">VIP</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Internal Notes</Label>
                  <textarea 
                    className="flex min-h-[80px] w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                    placeholder="Customer preferences, verified documents..."
                    value={formData.notes}
                    onChange={(e) => setFormData({...formData, notes: e.target.value})}
                  />
                </div>
                
                {saveError && (
                  <div className="bg-destructive/10 text-destructive text-sm p-3 rounded-md flex items-center gap-2">
                    <AlertCircle className="h-4 w-4" />
                    {saveError}
                  </div>
                )}
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setIsAddModalOpen(false)} disabled={isSaving}>Cancel</Button>
                <Button onClick={handleSaveCustomer} disabled={isSaving}>
                  {isSaving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Save Customer
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {fetchError && (
        <div className="bg-destructive/10 text-destructive p-4 rounded-lg flex items-center gap-2">
          <AlertCircle className="h-5 w-5" />
          {fetchError}
        </div>
      )}

      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[60px]"></TableHead>
                <TableHead>Name</TableHead>
                <TableHead>Phone & Email</TableHead>
                <TableHead>Tag</TableHead>
                <TableHead className="text-center">Total Rentals</TableHead>
                <TableHead>Total Spent</TableHead>
                <TableHead>Last Rental</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <TableRow key={i} className="animate-pulse">
                    <TableCell><div className="h-9 w-9 bg-muted rounded-full"></div></TableCell>
                    <TableCell><div className="h-4 w-32 bg-muted rounded"></div></TableCell>
                    <TableCell>
                      <div className="space-y-2">
                        <div className="h-3 w-24 bg-muted rounded"></div>
                        <div className="h-3 w-32 bg-muted rounded"></div>
                      </div>
                    </TableCell>
                    <TableCell><div className="h-5 w-16 bg-muted rounded-full"></div></TableCell>
                    <TableCell><div className="h-4 w-8 bg-muted rounded mx-auto"></div></TableCell>
                    <TableCell><div className="h-4 w-16 bg-muted rounded"></div></TableCell>
                    <TableCell><div className="h-4 w-24 bg-muted rounded"></div></TableCell>
                    <TableCell className="text-right"><div className="h-8 w-8 bg-muted rounded inline-block"></div></TableCell>
                  </TableRow>
                ))
              ) : filteredCustomers.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={8} className="h-24 text-center text-muted-foreground">
                    No customers found.
                  </TableCell>
                </TableRow>
              ) : (
                filteredCustomers.map((customer) => (
                  <TableRow 
                    key={customer.id}
                    className="cursor-pointer hover:bg-muted/50 transition-colors"
                    onClick={() => setSelectedCustomer(customer)}
                  >
                    <TableCell>
                      <Avatar className="h-9 w-9">
                        <AvatarFallback className="bg-primary/10 text-primary font-medium">{customer.initials}</AvatarFallback>
                      </Avatar>
                    </TableCell>
                    <TableCell className="font-medium text-base">{customer.full_name}</TableCell>
                    <TableCell>
                      <div className="flex flex-col space-y-1">
                        <span className="text-sm text-foreground flex items-center gap-1.5"><Phone className="h-3 w-3 text-muted-foreground"/> {customer.phone || '-'}</span>
                        <span className="text-xs text-muted-foreground flex items-center gap-1.5"><Mail className="h-3 w-3"/> {customer.email || '-'}</span>
                      </div>
                    </TableCell>
                    <TableCell>{getTagBadge(customer.tag)}</TableCell>
                    <TableCell className="text-center font-medium">{customer.total_rentals}</TableCell>
                    <TableCell className="font-semibold">${customer.total_spent?.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</TableCell>
                    <TableCell className="text-muted-foreground">{customer.last_rental}</TableCell>
                    <TableCell className="text-right">
                      <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-primary">
                        <Eye className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Sheet open={!!selectedCustomer} onOpenChange={(open) => !open && setSelectedCustomer(null)}>
        {selectedCustomer && (
          <SheetContent className="w-[400px] sm:w-[600px] overflow-y-auto border-l">
            <SheetHeader className="mb-6 pt-6 text-left">
              <div className="flex items-center gap-4 mb-4">
                <Avatar className="h-20 w-20 border-4 border-background shadow-sm">
                  <AvatarFallback className="bg-primary/10 text-primary text-2xl font-bold">{selectedCustomer.initials}</AvatarFallback>
                </Avatar>
                <div>
                  <SheetTitle className="text-2xl">{selectedCustomer.full_name}</SheetTitle>
                  <div className="flex items-center gap-2 mt-1">
                    {getTagBadge(selectedCustomer.tag)}
                    {selectedCustomer.phone && (
                      <span className="text-sm text-muted-foreground flex items-center gap-1 ml-2">
                        <Phone className="h-3 w-3"/> {selectedCustomer.phone}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </SheetHeader>
            
            <div className="space-y-6">
              {/* Summary Boxes */}
              <div className="grid grid-cols-2 gap-4">
                <div className="rounded-lg border bg-card p-4 flex flex-col items-center justify-center text-center">
                  <CreditCard className="h-5 w-5 text-muted-foreground mb-2" />
                  <p className="text-sm text-muted-foreground mb-1">Total Spent</p>
                  <p className="text-2xl font-bold text-primary">${selectedCustomer.total_spent?.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
                </div>
                <div className="rounded-lg border bg-card p-4 flex flex-col items-center justify-center text-center">
                  <CarIcon className="h-5 w-5 text-muted-foreground mb-2" />
                  <p className="text-sm text-muted-foreground mb-1">Total Rentals</p>
                  <p className="text-2xl font-bold">{selectedCustomer.total_rentals}</p>
                </div>
              </div>

              {/* Contact Info */}
              <div>
                <h4 className="font-semibold mb-3">Contact Details</h4>
                <div className="rounded-lg border bg-card p-4 space-y-3 text-sm">
                  <div className="flex items-center justify-between border-b pb-2">
                    <span className="text-muted-foreground">Email Address</span>
                    <span className="font-medium">{selectedCustomer.email || 'N/A'}</span>
                  </div>
                  <div className="flex items-center justify-between border-b pb-2">
                    <span className="text-muted-foreground">Phone Number</span>
                    <span className="font-medium">{selectedCustomer.phone || 'N/A'}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">Registered Date</span>
                    <span className="font-medium">{formatDate(selectedCustomer.created_at)}</span>
                  </div>
                </div>
              </div>

              {/* Rental History Mini Table */}
              <div>
                <h4 className="font-semibold mb-3">Recent Rental History</h4>
                <div className="rounded-lg border overflow-hidden">
                  <Table>
                    <TableHeader className="bg-muted/50">
                      <TableRow>
                        <TableHead>Vehicle</TableHead>
                        <TableHead>Dates</TableHead>
                        <TableHead>Amount</TableHead>
                        <TableHead>Status</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {selectedCustomer.bookings?.length === 0 ? (
                        <TableRow>
                          <TableCell colSpan={4} className="text-center text-muted-foreground py-6">
                            No rental history yet.
                          </TableCell>
                        </TableRow>
                      ) : (
                        [...selectedCustomer.bookings]
                          .sort((a, b) => new Date(b.start_date).getTime() - new Date(a.start_date).getTime())
                          .map((booking) => (
                          <TableRow key={booking.id}>
                            <TableCell className="font-medium">{booking.cars?.name || 'Unknown'}</TableCell>
                            <TableCell className="text-xs text-muted-foreground">
                              {formatDate(booking.start_date)} - {formatDate(booking.end_date)}
                            </TableCell>
                            <TableCell>${booking.total_amount}</TableCell>
                            <TableCell>{getStatusBadge(booking.status)}</TableCell>
                          </TableRow>
                        ))
                      )}
                    </TableBody>
                  </Table>
                </div>
              </div>

              {/* Notes */}
              <div>
                <h4 className="font-semibold mb-3">Internal Notes</h4>
                <div className="rounded-lg border bg-muted/30 p-4 text-sm text-muted-foreground whitespace-pre-wrap">
                  {selectedCustomer.notes || "No internal notes for this customer."}
                </div>
              </div>
            </div>
          </SheetContent>
        )}
      </Sheet>
    </div>
  );
}
