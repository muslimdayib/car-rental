const fs = require('fs');
const path = require('path');

function generateMockData() {
  const brands = ['Toyota', 'Honda', 'Ford', 'BMW', 'Mercedes', 'Tesla', 'Audi', 'Hyundai', 'Kia', 'Volkswagen'];
  const categories = ['Sedan', 'SUV', 'Luxury', 'Electric', 'Compact', 'Van'];
  const statuses = ['Available', 'Rented', 'Maintenance', 'Sold'];
  const fuelTypes = ['Gasoline', 'Diesel', 'Electric', 'Hybrid'];

  const cars = Array.from({ length: 48 }, (_, i) => {
    const brand = brands[Math.floor(Math.random() * brands.length)];
    const id = `CAR-${String(i + 1).padStart(3, '0')}`;
    const purchasePrice = 20000 + Math.floor(Math.random() * 50000);
    return {
      id,
      name: `${brand} Model ${String.fromCharCode(65 + (i % 5))}`,
      brand,
      plate: `${String.fromCharCode(65 + Math.floor(Math.random() * 26))}${String.fromCharCode(65 + Math.floor(Math.random() * 26))}-${1000 + i}`,
      status: statuses[Math.floor(Math.random() * statuses.length)],
      pricePerDay: 40 + Math.floor(Math.random() * 100),
      year: 2018 + Math.floor(Math.random() * 7),
      mileage: Math.floor(Math.random() * 100000),
      fuelType: fuelTypes[Math.floor(Math.random() * fuelTypes.length)],
      category: categories[Math.floor(Math.random() * categories.length)],
      imageUrl: 'https://images.unsplash.com/photo-1560958089-b8a1929cea89?w=800&q=80',
      purchasePrice,
      currentValue: purchasePrice * (0.5 + Math.random() * 0.4),
      depreciationRate: 0.1 + Math.random() * 0.15
    };
  });

  const customerTags = ['New', 'Returning', 'VIP'];
  const customers = Array.from({ length: 30 }, (_, i) => ({
    id: `CUST-${String(i + 1).padStart(3, '0')}`,
    name: `Customer ${i + 1}`,
    phone: `+1 555-01${String(i).padStart(2, '0')}`,
    email: `customer${i + 1}@example.com`,
    tag: customerTags[Math.floor(Math.random() * customerTags.length)],
    rentalHistory: Math.floor(Math.random() * 10),
    totalSpent: Math.floor(Math.random() * 5000)
  }));

  const bookingStatuses = ['Reserved', 'Active', 'Completed', 'Cancelled'];
  const paymentStatuses = ['Paid', 'Pending', 'Failed'];
  const bookings = Array.from({ length: 25 }, (_, i) => ({
    id: `BKG-${String(i + 1).padStart(4, '0')}`,
    customerId: customers[Math.floor(Math.random() * customers.length)].id,
    carId: cars[Math.floor(Math.random() * cars.length)].id,
    startDate: new Date(Date.now() - Math.random() * 10000000000).toISOString().split('T')[0],
    endDate: new Date(Date.now() + Math.random() * 10000000000).toISOString().split('T')[0],
    status: bookingStatuses[Math.floor(Math.random() * bookingStatuses.length)],
    totalAmount: 100 + Math.floor(Math.random() * 1000),
    paymentStatus: paymentStatuses[Math.floor(Math.random() * paymentStatuses.length)]
  }));

  const employees = Array.from({ length: 15 }, (_, i) => ({
    id: `EMP-${String(i + 1).padStart(3, '0')}`,
    name: `Employee ${i + 1}`,
    role: ['Manager', 'Agent', 'Technician', 'Admin'][Math.floor(Math.random() * 4)],
    status: Math.random() > 0.2 ? 'Active' : 'Off'
  }));

  const drivers = Array.from({ length: 20 }, (_, i) => ({
    id: `DRV-${String(i + 1).padStart(3, '0')}`,
    name: `Driver ${i + 1}`,
    licenseNumber: `DL-${Math.floor(Math.random() * 1000000)}`,
    status: ['Available', 'On Trip', 'Off Duty'][Math.floor(Math.random() * 3)]
  }));

  const maintenanceRecords = Array.from({ length: 12 }, (_, i) => ({
    id: `MNT-${String(i + 1).padStart(3, '0')}`,
    carId: cars[Math.floor(Math.random() * cars.length)].id,
    issue: ['Oil Change', 'Tire Rotation', 'Brake Pad Replacement', 'Engine Check'][Math.floor(Math.random() * 4)],
    cost: 50 + Math.floor(Math.random() * 500),
    status: ['Completed', 'In Progress', 'Pending'][Math.floor(Math.random() * 3)],
    date: new Date(Date.now() - Math.random() * 5000000000).toISOString().split('T')[0]
  }));

  const fuelLogs = Array.from({ length: 10 }, (_, i) => ({
    id: `FUEL-${String(i + 1).padStart(3, '0')}`,
    carId: cars[Math.floor(Math.random() * cars.length)].id,
    date: new Date(Date.now() - Math.random() * 2000000000).toISOString().split('T')[0],
    liters: 20 + Math.floor(Math.random() * 40),
    cost: 30 + Math.floor(Math.random() * 70)
  }));

  const insurancePolicies = Array.from({ length: 8 }, (_, i) => ({
    id: `INS-${String(i + 1).padStart(3, '0')}`,
    carId: cars[Math.floor(Math.random() * cars.length)].id,
    provider: ['SafeDrive', 'AutoGuard', 'SecureRide'][Math.floor(Math.random() * 3)],
    expiry: new Date(Date.now() + Math.random() * 15000000000).toISOString().split('T')[0],
    status: Math.random() > 0.2 ? 'Active' : 'Expiring Soon'
  }));

  const claims = Array.from({ length: 5 }, (_, i) => ({
    id: `CLM-${String(i + 1).padStart(3, '0')}`,
    carId: cars[Math.floor(Math.random() * cars.length)].id,
    driverId: drivers[Math.floor(Math.random() * drivers.length)].id,
    date: new Date(Date.now() - Math.random() * 5000000000).toISOString().split('T')[0],
    status: ['Under Review', 'Approved', 'Rejected'][Math.floor(Math.random() * 3)],
    amount: 500 + Math.floor(Math.random() * 4500)
  }));

  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const monthlyData = months.map(month => ({
    name: month,
    revenue: 50000 + Math.floor(Math.random() * 50000),
    expenses: 20000 + Math.floor(Math.random() * 20000)
  }));

  const content = `// Auto-generated mock data for Car Rental ERP

export const carsData = ${JSON.stringify(cars, null, 2)};

export const customersData = ${JSON.stringify(customers, null, 2)};

export const bookingsData = ${JSON.stringify(bookings, null, 2)};

export const employeesData = ${JSON.stringify(employees, null, 2)};

export const driversData = ${JSON.stringify(drivers, null, 2)};

export const maintenanceData = ${JSON.stringify(maintenanceRecords, null, 2)};

export const fuelLogs = ${JSON.stringify(fuelLogs, null, 2)};

export const insurancePolicies = ${JSON.stringify(insurancePolicies, null, 2)};

export const claimsData = ${JSON.stringify(claims, null, 2)};

export const monthlyFinancialData = ${JSON.stringify(monthlyData, null, 2)};
`;

  const targetDir = path.join(__dirname, 'src', 'data', 'mock');
  if (!fs.existsSync(targetDir)) {
    fs.mkdirSync(targetDir, { recursive: true });
  }
  
  fs.writeFileSync(path.join(targetDir, 'index.ts'), content);
  console.log('Mock data generated successfully!');
}

generateMockData();
