-- AeroConnect Database Schema
-- Version 1.0

-- Users table (for authentication and basic info)
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  role VARCHAR(50) NOT NULL CHECK (role IN ('pilot', 'passenger', 'meister', 'admin')),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Pilots table (extended profile for pilots)
CREATE TABLE IF NOT EXISTS pilots (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID UNIQUE NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  full_name VARCHAR(255) NOT NULL,
  phone VARCHAR(50) NOT NULL,
  license_number VARCHAR(100) NOT NULL,
  license_expiry DATE NOT NULL,
  insurance_provider VARCHAR(255) NOT NULL,
  insurance_policy_number VARCHAR(100) NOT NULL,
  insurance_expiry DATE NOT NULL,
  balloon_registration VARCHAR(100) NOT NULL,
  balloon_capacity INTEGER NOT NULL,
  years_experience INTEGER NOT NULL,
  total_flight_hours INTEGER NOT NULL,
  verification_status VARCHAR(50) DEFAULT 'pending' CHECK (verification_status IN ('pending', 'approved', 'rejected')),
  qr_code_url VARCHAR(500),
  subscription_status VARCHAR(50) DEFAULT 'inactive' CHECK (subscription_status IN ('active', 'inactive', 'cancelled')),
  subscription_tier VARCHAR(50) CHECK (subscription_tier IN ('basic', 'premium')),
  stripe_customer_id VARCHAR(255),
  stripe_subscription_id VARCHAR(255),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Passengers table (for notification sign-ups)
CREATE TABLE IF NOT EXISTS passengers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID UNIQUE NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  full_name VARCHAR(255) NOT NULL,
  phone VARCHAR(50) NOT NULL,
  email_notifications BOOLEAN DEFAULT true,
  sms_notifications BOOLEAN DEFAULT true,
  preferred_locations TEXT[], -- Array of preferred locations
  max_distance_km INTEGER DEFAULT 50,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Festival Meisters table (festival organizers)
CREATE TABLE IF NOT EXISTS meisters (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID UNIQUE NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  organization_name VARCHAR(255) NOT NULL,
  contact_name VARCHAR(255) NOT NULL,
  phone VARCHAR(50) NOT NULL,
  festival_name VARCHAR(255) NOT NULL,
  festival_location VARCHAR(255) NOT NULL,
  festival_date DATE NOT NULL,
  service_tier VARCHAR(50) NOT NULL CHECK (service_tier IN ('basic', 'premium', 'vip')),
  stripe_customer_id VARCHAR(255),
  stripe_payment_intent_id VARCHAR(255),
  payment_status VARCHAR(50) DEFAULT 'pending' CHECK (payment_status IN ('pending', 'paid', 'failed')),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Notifications table (track sent notifications)
CREATE TABLE IF NOT EXISTS notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  pilot_id UUID NOT NULL REFERENCES pilots(id) ON DELETE CASCADE,
  passenger_id UUID NOT NULL REFERENCES passengers(id) ON DELETE CASCADE,
  notification_type VARCHAR(50) NOT NULL CHECK (notification_type IN ('email', 'sms', 'both')),
  location VARCHAR(255) NOT NULL,
  distance_km DECIMAL(10, 2) NOT NULL,
  sent_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  status VARCHAR(50) DEFAULT 'sent' CHECK (status IN ('sent', 'delivered', 'failed'))
);

-- Pilot availability table (when pilots are available for flights)
CREATE TABLE IF NOT EXISTS pilot_availability (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  pilot_id UUID NOT NULL REFERENCES pilots(id) ON DELETE CASCADE,
  location VARCHAR(255) NOT NULL,
  latitude DECIMAL(10, 8) NOT NULL,
  longitude DECIMAL(11, 8) NOT NULL,
  available_from TIMESTAMP NOT NULL,
  available_to TIMESTAMP NOT NULL,
  max_passengers INTEGER NOT NULL,
  price_per_person DECIMAL(10, 2) NOT NULL,
  status VARCHAR(50) DEFAULT 'active' CHECK (status IN ('active', 'booked', 'cancelled')),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_role ON users(role);
CREATE INDEX IF NOT EXISTS idx_pilots_user_id ON pilots(user_id);
CREATE INDEX IF NOT EXISTS idx_pilots_verification_status ON pilots(verification_status);
CREATE INDEX IF NOT EXISTS idx_passengers_user_id ON passengers(user_id);
CREATE INDEX IF NOT EXISTS idx_meisters_user_id ON meisters(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_pilot_id ON notifications(pilot_id);
CREATE INDEX IF NOT EXISTS idx_notifications_passenger_id ON notifications(passenger_id);
CREATE INDEX IF NOT EXISTS idx_pilot_availability_pilot_id ON pilot_availability(pilot_id);
CREATE INDEX IF NOT EXISTS idx_pilot_availability_status ON pilot_availability(status);
