export const kpiData = {
  totalCars: 145,
  availableCars: 42,
  activeRentals: 89,
  maintenance: 14,
  revenueMonthly: 124500,
  expensesMonthly: 38200,
};

export const revenueData = [
  { name: "Jan", revenue: 84000, expenses: 32000 },
  { name: "Feb", revenue: 92000, expenses: 34000 },
  { name: "Mar", revenue: 105000, expenses: 36000 },
  { name: "Apr", revenue: 110000, expenses: 35000 },
  { name: "May", revenue: 124500, expenses: 38200 },
  { name: "Jun", revenue: 130000, expenses: 40000 },
];

export const recentBookings = [
  { id: "B-1042", customer: "Sarah Johnson", car: "Tesla Model 3", status: "Active", date: "2026-05-01 to 2026-05-05" },
  { id: "B-1043", customer: "Michael Chen", car: "BMW 5 Series", status: "Reserved", date: "2026-05-06 to 2026-05-10" },
  { id: "B-1044", customer: "Emma Williams", car: "Toyota RAV4", status: "Completed", date: "2026-04-28 to 2026-05-02" },
  { id: "B-1045", customer: "James Rodriguez", car: "Mercedes C-Class", status: "Active", date: "2026-05-03 to 2026-05-08" },
  { id: "B-1046", customer: "Alex Smith", car: "Honda Civic", status: "Cancelled", date: "2026-05-04 to 2026-05-07" },
];

export const alertsData = [
  { id: 1, type: "warning", message: "Late Return: Toyota RAV4 (B-1039) was due yesterday.", time: "2 hours ago" },
  { id: 2, type: "destructive", message: "Insurance Expiry: Tesla Model Y insurance expires in 3 days.", time: "5 hours ago" },
  { id: 3, type: "info", message: "Maintenance Due: BMW X5 has reached 15,000km service interval.", time: "1 day ago" },
];

export const carsData = [
  { id: "C-001", brand: "Tesla", model: "Model 3", plate: "ABC-123", status: "Available", price: 120, image: "https://images.unsplash.com/photo-1560958089-b8a1929cea89?w=800&q=80" },
  { id: "C-002", brand: "BMW", model: "5 Series", plate: "XYZ-789", status: "Rented", price: 150, image: "https://images.unsplash.com/photo-1555215695-3004980ad54e?w=800&q=80" },
  { id: "C-003", brand: "Toyota", model: "RAV4", plate: "LMN-456", status: "Maintenance", price: 80, image: "https://images.unsplash.com/photo-1621007947382-bb3c3994e3fd?w=800&q=80" },
  { id: "C-004", brand: "Mercedes", model: "C-Class", plate: "DEF-901", status: "Available", price: 140, image: "https://images.unsplash.com/photo-1618843479313-40f8afb4b4d8?w=800&q=80" },
  { id: "C-005", brand: "Honda", model: "Civic", plate: "GHI-234", status: "Rented", price: 60, image: "https://images.unsplash.com/photo-1606611013016-969c19ba27bb?w=800&q=80" },
];

export const customersData = [
  { id: "CUST-001", name: "Sarah Johnson", phone: "+1 (555) 123-4567", email: "sarah.j@example.com", tag: "VIP", rentals: 12, totalSpent: 4500 },
  { id: "CUST-002", name: "Michael Chen", phone: "+1 (555) 987-6543", email: "michael.c@example.com", tag: "Returning", rentals: 4, totalSpent: 1200 },
  { id: "CUST-003", name: "Emma Williams", phone: "+1 (555) 456-7890", email: "emma.w@example.com", tag: "New", rentals: 1, totalSpent: 300 },
];

export const employeesData = [
  { id: "EMP-01", name: "David Miller", role: "Fleet Manager", status: "Active", attendance: "Present", salary: "$5,200/mo" },
  { id: "EMP-02", name: "Lisa Wong", role: "Customer Service", status: "Active", attendance: "Present", salary: "$3,800/mo" },
  { id: "EMP-03", name: "John Davis", role: "Mechanic", status: "Off", attendance: "Absent", salary: "$4,500/mo" },
];

export const maintenanceData = [
  { id: "M-001", car: "Toyota RAV4 (LMN-456)", issue: "Brake pad replacement", cost: 350, status: "In Progress", date: "2026-05-02" },
  { id: "M-002", car: "Honda Civic (GHI-234)", issue: "Oil change", cost: 85, status: "Completed", date: "2026-04-28" },
  { id: "M-003", car: "BMW X5 (PQR-333)", issue: "15,000km Service", cost: 650, status: "Pending", date: "2026-05-05" },
];

export const fuelLogs = [
  { id: "F-001", car: "Mercedes C-Class", date: "2026-05-02", liters: 45, cost: 72 },
  { id: "F-002", car: "Toyota RAV4", date: "2026-05-01", liters: 38, cost: 60.8 },
  { id: "F-003", car: "BMW 5 Series", date: "2026-04-30", liters: 52, cost: 83.2 },
];

export const insurancePolicies = [
  { id: "INS-001", car: "Tesla Model Y", provider: "SafeDrive Auto", expiry: "2026-05-06", status: "Expiring Soon" },
  { id: "INS-002", car: "BMW 5 Series", provider: "Premium Protect", expiry: "2026-11-15", status: "Active" },
  { id: "INS-003", car: "Toyota RAV4", provider: "Standard Cover", expiry: "2027-02-10", status: "Active" },
];

export const claimsData = [
  { id: "CLM-001", car: "Honda Civic", driver: "Alex Smith", date: "2026-04-15", status: "Under Review", amount: 1200 },
  { id: "CLM-002", car: "Mercedes C-Class", driver: "James Rodriguez", date: "2026-03-22", status: "Approved", amount: 450 },
];
