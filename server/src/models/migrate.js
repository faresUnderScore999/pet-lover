const { pool } = require("../db");

const SQL = `
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  role VARCHAR(50) NOT NULL DEFAULT 'citizen' CHECK (role IN ('citizen','rescuer','vet','association','admin')),
  phone VARCHAR(50),
  city VARCHAR(100),
  full_name VARCHAR(255),
  avatar_url TEXT,
  is_verified BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS incident_reports (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  reporter_id UUID REFERENCES users(id) ON DELETE SET NULL,
  type VARCHAR(50) NOT NULL CHECK (type IN ('stray_pack','injured_animal','trash_bin','unleashed_pet','abandonment')),
  latitude DECIMAL(10, 7) NOT NULL,
  longitude DECIMAL(10, 7) NOT NULL,
  description TEXT,
  severity VARCHAR(20) DEFAULT 'medium' CHECK (severity IN ('low','medium','high','critical')),
  status VARCHAR(30) DEFAULT 'pending' CHECK (status IN ('pending','verified','resolved','dismissed')),
  image_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  resolved_at TIMESTAMP WITH TIME ZONE
);

CREATE TABLE IF NOT EXISTS safety_flags (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  type VARCHAR(50) NOT NULL CHECK (type IN ('active_pack','unlit_area','safe_zone','dangerous_intersection')),
  latitude DECIMAL(10, 7) NOT NULL,
  longitude DECIMAL(10, 7) NOT NULL,
  radius_meters INTEGER DEFAULT 100,
  reported_by UUID REFERENCES users(id) ON DELETE SET NULL,
  expires_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS animals (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  listed_by_id UUID REFERENCES users(id) ON DELETE SET NULL,
  name VARCHAR(100),
  species VARCHAR(20) NOT NULL CHECK (species IN ('dog','cat')),
  age VARCHAR(50),
  gender VARCHAR(20) CHECK (gender IN ('male','female','unknown')),
  health_status VARCHAR(100),
  sterilized BOOLEAN DEFAULT FALSE,
  vaccinated BOOLEAN DEFAULT FALSE,
  location VARCHAR(255),
  latitude DECIMAL(10, 7),
  longitude DECIMAL(10, 7),
  photos JSONB DEFAULT '[]',
  description TEXT,
  adoption_status VARCHAR(30) DEFAULT 'available' CHECK (adoption_status IN ('available','adopted','fostered','pending')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS tnr_cases (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  animal_id UUID REFERENCES animals(id) ON DELETE SET NULL,
  rescuer_id UUID REFERENCES users(id) ON DELETE SET NULL,
  association_id UUID REFERENCES users(id) ON DELETE SET NULL,
  vet_id UUID REFERENCES users(id) ON DELETE SET NULL,
  status VARCHAR(30) DEFAULT 'requested' CHECK (status IN ('requested','scheduled','completed','cancelled')),
  procedure_date TIMESTAMP WITH TIME ZONE,
  estimated_cost DECIMAL(10, 2),
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS donations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  tnr_case_id UUID REFERENCES tnr_cases(id) ON DELETE SET NULL,
  animal_id UUID REFERENCES animals(id) ON DELETE SET NULL,
  donor_id UUID REFERENCES users(id) ON DELETE SET NULL,
  amount DECIMAL(10, 2) NOT NULL,
  currency VARCHAR(10) DEFAULT 'TND',
  status VARCHAR(30) DEFAULT 'completed' CHECK (status IN ('pending','completed','failed','refunded')),
  message TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS clean_up_initiatives (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  organizer_id UUID REFERENCES users(id) ON DELETE SET NULL,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  location VARCHAR(255),
  latitude DECIMAL(10, 7),
  longitude DECIMAL(10, 7),
  event_date TIMESTAMP WITH TIME ZONE,
  volunteers_needed INTEGER DEFAULT 10,
  volunteers_joined INTEGER DEFAULT 0,
  status VARCHAR(30) DEFAULT 'planned' CHECK (status IN ('planned','ongoing','completed','cancelled')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS waste_bins (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  latitude DECIMAL(10, 7) NOT NULL,
  longitude DECIMAL(10, 7) NOT NULL,
  is_secure BOOLEAN DEFAULT TRUE,
  reported_by UUID REFERENCES users(id) ON DELETE SET NULL,
  last_checked TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_incident_reports_location ON incident_reports(latitude, longitude);
CREATE INDEX IF NOT EXISTS idx_safety_flags_location ON safety_flags(latitude, longitude);
CREATE INDEX IF NOT EXISTS idx_animals_location ON animals(latitude, longitude);
CREATE INDEX IF NOT EXISTS idx_waste_bins_location ON waste_bins(latitude, longitude);
CREATE INDEX IF NOT EXISTS idx_incident_reports_status ON incident_reports(status);
CREATE INDEX IF NOT EXISTS idx_animals_status ON animals(adoption_status);
CREATE INDEX IF NOT EXISTS idx_tnr_cases_status ON tnr_cases(status);
`;

async function run() {
  try {
    await pool.query(SQL);
    console.log("Database migration completed successfully");
  } catch (err) {
    console.error("Migration failed:", err.message);
    process.exit(1);
  } finally {
    await pool.end();
  }
}

run();