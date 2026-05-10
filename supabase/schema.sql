-- Enable UUID generation
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-----------------------------------------------------
-- 1. Cars Table
-----------------------------------------------------
CREATE TABLE cars (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    brand VARCHAR(100),
    model VARCHAR(100),
    year INTEGER,
    plate_number VARCHAR(50) UNIQUE NOT NULL,
    category VARCHAR(50),
    fuel_type VARCHAR(50),
    status VARCHAR(50) DEFAULT 'Available',
    price_per_day NUMERIC(10, 2),
    purchase_price NUMERIC(12, 2),
    current_value NUMERIC(12, 2),
    depreciation_rate NUMERIC(5, 2),
    mileage INTEGER,
    color VARCHAR(50),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-----------------------------------------------------
-- 2. Customers Table
-----------------------------------------------------
CREATE TABLE customers (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    full_name VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE,
    phone VARCHAR(50),
    tag VARCHAR(50),
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-----------------------------------------------------
-- 3. Drivers Table
-----------------------------------------------------
CREATE TABLE drivers (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    full_name VARCHAR(255) NOT NULL,
    license_number VARCHAR(100) UNIQUE NOT NULL,
    license_type VARCHAR(50),
    license_expiry DATE,
    phone VARCHAR(50),
    nationality VARCHAR(100),
    emergency_contact VARCHAR(255),
    status VARCHAR(50) DEFAULT 'Active',
    behavior_score INTEGER DEFAULT 5,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-----------------------------------------------------
-- 4. Employees Table
-----------------------------------------------------
CREATE TABLE employees (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    full_name VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE,
    role VARCHAR(100),
    department VARCHAR(100),
    status VARCHAR(50) DEFAULT 'Active',
    base_salary NUMERIC(10, 2),
    allowance NUMERIC(10, 2) DEFAULT 0,
    deduction NUMERIC(10, 2) DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-----------------------------------------------------
-- 5. Bookings Table
-----------------------------------------------------
CREATE TABLE bookings (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    customer_id UUID REFERENCES customers(id) ON DELETE RESTRICT,
    car_id UUID REFERENCES cars(id) ON DELETE RESTRICT,
    driver_id UUID REFERENCES drivers(id) ON DELETE SET NULL,
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    total_amount NUMERIC(10, 2),
    status VARCHAR(50) DEFAULT 'Reserved',
    payment_status VARCHAR(50) DEFAULT 'Pending',
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-----------------------------------------------------
-- 6. Maintenance Table
-----------------------------------------------------
CREATE TABLE maintenance (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    car_id UUID REFERENCES cars(id) ON DELETE CASCADE,
    employee_id UUID REFERENCES employees(id) ON DELETE SET NULL,
    issue VARCHAR(255) NOT NULL,
    description TEXT,
    priority VARCHAR(50),
    cost NUMERIC(10, 2),
    status VARCHAR(50) DEFAULT 'Scheduled',
    start_date DATE,
    end_date DATE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-----------------------------------------------------
-- 7. Fuel Logs Table
-----------------------------------------------------
CREATE TABLE fuel_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    car_id UUID REFERENCES cars(id) ON DELETE CASCADE,
    driver_id UUID REFERENCES drivers(id) ON DELETE SET NULL,
    date DATE NOT NULL,
    liters NUMERIC(8, 2),
    cost_per_liter NUMERIC(8, 2),
    total_cost NUMERIC(10, 2),
    odometer INTEGER,
    station VARCHAR(255),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-----------------------------------------------------
-- 8. Insurance Policies Table
-----------------------------------------------------
CREATE TABLE insurance_policies (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    car_id UUID REFERENCES cars(id) ON DELETE CASCADE,
    provider VARCHAR(255) NOT NULL,
    policy_number VARCHAR(100) UNIQUE NOT NULL,
    type VARCHAR(100),
    start_date DATE,
    end_date DATE,
    premium NUMERIC(10, 2),
    status VARCHAR(50) DEFAULT 'Active',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-----------------------------------------------------
-- 9. Claims Table
-----------------------------------------------------
CREATE TABLE claims (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    car_id UUID REFERENCES cars(id) ON DELETE CASCADE,
    driver_id UUID REFERENCES drivers(id) ON DELETE SET NULL,
    policy_id UUID REFERENCES insurance_policies(id) ON DELETE SET NULL,
    incident_date DATE NOT NULL,
    incident_type VARCHAR(100),
    description TEXT,
    estimated_cost NUMERIC(10, 2),
    status VARCHAR(50) DEFAULT 'Open',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-----------------------------------------------------
-- 10. Car Sales Table
-----------------------------------------------------
CREATE TABLE car_sales (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    car_id UUID REFERENCES cars(id) ON DELETE RESTRICT,
    sale_price NUMERIC(12, 2) NOT NULL,
    buyer_name VARCHAR(255),
    sale_date DATE NOT NULL,
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-----------------------------------------------------
-- Enable Row Level Security (RLS)
-----------------------------------------------------
ALTER TABLE cars ENABLE ROW LEVEL SECURITY;
ALTER TABLE customers ENABLE ROW LEVEL SECURITY;
ALTER TABLE drivers ENABLE ROW LEVEL SECURITY;
ALTER TABLE employees ENABLE ROW LEVEL SECURITY;
ALTER TABLE bookings ENABLE ROW LEVEL SECURITY;
ALTER TABLE maintenance ENABLE ROW LEVEL SECURITY;
ALTER TABLE fuel_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE insurance_policies ENABLE ROW LEVEL SECURITY;
ALTER TABLE claims ENABLE ROW LEVEL SECURITY;
ALTER TABLE car_sales ENABLE ROW LEVEL SECURITY;
