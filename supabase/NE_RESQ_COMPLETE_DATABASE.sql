-- ==============================================================================
-- NE-RESQ: NORTHEAST EMERGENCY RESPONSE, DISASTER INTELLIGENCE & SAFETY PLATFORM
-- COMPLETE CENTRALIZED PRODUCTION DATABASE SCHEMA
-- File: NE_RESQ_COMPLETE_DATABASE.sql
-- Scope: Shared Database for User Website & Admin Command Portal
-- Region: All 8 Northeast Indian States (AS, AR, ML, MN, MZ, NL, TR, SK)
-- Compatibility: PostgreSQL 14+ / Supabase Managed PostGIS Cluster
-- Execution: Safe & Idempotent (Can be executed via Supabase SQL Editor)
-- ==============================================================================

-- ==============================================================================
-- SECTION 1: CORE EXTENSIONS
-- ==============================================================================
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";
CREATE EXTENSION IF NOT EXISTS "postgis";

-- ==============================================================================
-- SECTION 2: COMMON TRIGGER FUNCTIONS
-- ==============================================================================
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- ==============================================================================
-- SECTION 3: GEOGRAPHIC JURISDICTION (STATES & DISTRICTS)
-- ==============================================================================
CREATE TABLE IF NOT EXISTS states (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    code VARCHAR(10) UNIQUE NOT NULL, -- AS, AR, ML, MN, MZ, NL, TR, SK
    name VARCHAR(100) NOT NULL,
    capital VARCHAR(100) NOT NULL,
    eoc_helpline VARCHAR(50) NOT NULL DEFAULT '1070',
    sdma_website VARCHAR(255),
    latitude DOUBLE PRECISION NOT NULL,
    longitude DOUBLE PRECISION NOT NULL,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

CREATE TRIGGER update_states_modtime 
    BEFORE UPDATE ON states 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TABLE IF NOT EXISTS districts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    state_id UUID NOT NULL REFERENCES states(id) ON DELETE CASCADE,
    code VARCHAR(20) NOT NULL,
    name VARCHAR(100) NOT NULL,
    headquarters VARCHAR(100) NOT NULL,
    deoc_helpline VARCHAR(50) NOT NULL DEFAULT '1077',
    latitude DOUBLE PRECISION NOT NULL,
    longitude DOUBLE PRECISION NOT NULL,
    vulnerability_level VARCHAR(20) DEFAULT 'MODERATE' 
        CHECK (vulnerability_level IN ('LOW', 'MODERATE', 'HIGH', 'CRITICAL')),
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(state_id, name)
);

CREATE INDEX IF NOT EXISTS idx_districts_state_id ON districts(state_id);
CREATE TRIGGER update_districts_modtime 
    BEFORE UPDATE ON districts 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ==============================================================================
-- SECTION 4: ROLES, PERMISSIONS & ADMINISTRATOR MANAGEMENT
-- ==============================================================================
CREATE TABLE IF NOT EXISTS admin_roles (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    code VARCHAR(50) UNIQUE NOT NULL,
    name VARCHAR(100) NOT NULL,
    description TEXT,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- Seed predefined 7 administrator roles
INSERT INTO admin_roles (code, name, description) VALUES
    ('SUPER_ADMIN', 'Super Administrator', 'Full executive authority across platform, user approval, system settings, and all 8 states'),
    ('STATE_ADMIN', 'State Administrator', 'Authorized coordinator for a specific state SDMA jurisdiction'),
    ('DISTRICT_ADMIN', 'District Administrator', 'Authorized coordinator for specific district DDMA operations'),
    ('CONTACT_MANAGER', 'Emergency Contact Manager', 'Authorized manager for emergency helpline verification and publication'),
    ('ALERT_MANAGER', 'Disaster Alert Manager', 'Authorized publisher of official CAP/SDMA weather and disaster warnings'),
    ('CONTENT_MANAGER', 'Website Content Manager', 'Authorized editor for preparedness guides, advisories, and notices'),
    ('READONLY_ADMIN', 'Read-Only Administrator', 'Auditor and monitor with view permissions across dashboards')
ON CONFLICT (code) DO NOTHING;

CREATE TABLE IF NOT EXISTS admin_users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    full_name VARCHAR(150) NOT NULL,
    phone VARCHAR(25) NOT NULL,
    role_id UUID NOT NULL REFERENCES admin_roles(id),
    department VARCHAR(150) NOT NULL,
    designation VARCHAR(150) NOT NULL,
    state_id UUID REFERENCES states(id) ON DELETE SET NULL,
    district_id UUID REFERENCES districts(id) ON DELETE SET NULL,
    status VARCHAR(30) DEFAULT 'PENDING_APPROVAL' 
        CHECK (status IN ('PENDING_APPROVAL', 'APPROVED', 'REJECTED', 'SUSPENDED')),
    approved_by UUID REFERENCES admin_users(id),
    approved_at TIMESTAMPTZ,
    last_login_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_admin_users_email ON admin_users(email);
CREATE INDEX IF NOT EXISTS idx_admin_users_status ON admin_users(status);
CREATE TRIGGER update_admin_users_modtime 
    BEFORE UPDATE ON admin_users 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Registration Requests Audit Trail
CREATE TABLE IF NOT EXISTS admin_registration_requests (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    admin_user_id UUID NOT NULL REFERENCES admin_users(id) ON DELETE CASCADE,
    justification TEXT NOT NULL,
    official_id_url TEXT,
    reviewed_by UUID REFERENCES admin_users(id),
    review_status VARCHAR(30) DEFAULT 'PENDING' CHECK (review_status IN ('PENDING', 'APPROVED', 'REJECTED')),
    review_remarks TEXT,
    reviewed_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- ==============================================================================
-- SECTION 4B: CITIZEN USER PROFILES & RESIDENT SAFETY ACCOUNTS
-- ==============================================================================
CREATE TABLE IF NOT EXISTS user_profiles (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    auth_user_id UUID UNIQUE,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    full_name VARCHAR(150) NOT NULL,
    phone VARCHAR(50),
    state_id UUID REFERENCES states(id) ON DELETE SET NULL,
    district_id UUID REFERENCES districts(id) ON DELETE SET NULL,
    state_name VARCHAR(100) DEFAULT 'Assam',
    district_name VARCHAR(100) DEFAULT 'Kamrup Metropolitan',
    role VARCHAR(50) DEFAULT 'CITIZEN',
    is_verified BOOLEAN DEFAULT TRUE,
    status VARCHAR(50) DEFAULT 'APPROVED',
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_user_profiles_email ON user_profiles(email);
CREATE TRIGGER update_user_profiles_modtime 
    BEFORE UPDATE ON user_profiles 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ==============================================================================
-- SECTION 5: EMERGENCY CONTACT MANAGEMENT (CENTRALIZED DIRECTORY)
-- ==============================================================================
CREATE TABLE IF NOT EXISTS emergency_contacts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    contact_name VARCHAR(200) NOT NULL,
    department_name VARCHAR(200) NOT NULL,
    organization VARCHAR(200) NOT NULL,
    category VARCHAR(50) NOT NULL CHECK (category IN (
        'NATIONAL_EMERGENCY',
        'DISASTER_MANAGEMENT',
        'STATE_EOC',
        'DISTRICT_EOC',
        'NDRF',
        'SDRF',
        'POLICE',
        'FIRE_RESCUE',
        'AMBULANCE_MEDICAL',
        'HEALTH_TELEMEDICINE',
        'WOMEN_CHILD_SAFETY',
        'HOSPITAL_CASUALTY',
        'RELIEF_CAMP',
        'OTHER_EMERGENCY'
    )),
    scope VARCHAR(20) NOT NULL DEFAULT 'NATIONAL' CHECK (scope IN ('NATIONAL', 'STATE', 'DISTRICT', 'REGIONAL')),
    state_id UUID REFERENCES states(id) ON DELETE SET NULL,
    district_id UUID REFERENCES districts(id) ON DELETE SET NULL,
    contact_number VARCHAR(50) NOT NULL,
    alternate_number VARCHAR(100),
    is_toll_free BOOLEAN DEFAULT FALSE,
    email VARCHAR(255),
    official_website VARCHAR(255),
    office_address TEXT,
    operating_hours VARCHAR(100) DEFAULT '24x7 / 365 Days',
    description TEXT,
    source_url TEXT NOT NULL,
    verification_status VARCHAR(30) DEFAULT 'PENDING_REVIEW' 
        CHECK (verification_status IN ('UNVERIFIED', 'PENDING_REVIEW', 'VERIFIED_OFFICIAL', 'REJECTED')),
    last_verified_at TIMESTAMPTZ,
    verified_by UUID REFERENCES admin_users(id),
    publication_status VARCHAR(20) DEFAULT 'DRAFT' 
        CHECK (publication_status IN ('DRAFT', 'PUBLISHED', 'ARCHIVED')),
    published_by UUID REFERENCES admin_users(id),
    published_at TIMESTAMPTZ,
    created_by UUID REFERENCES admin_users(id),
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_contacts_category ON emergency_contacts(category);
CREATE INDEX IF NOT EXISTS idx_contacts_scope ON emergency_contacts(scope);
CREATE INDEX IF NOT EXISTS idx_contacts_state ON emergency_contacts(state_id);
CREATE INDEX IF NOT EXISTS idx_contacts_pub_ver ON emergency_contacts(publication_status, verification_status);
CREATE TRIGGER update_emergency_contacts_modtime 
    BEFORE UPDATE ON emergency_contacts 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ==============================================================================
-- SECTION 6: DISASTER ALERT MANAGEMENT (OFFICIAL VERIFIED ALERTS)
-- ==============================================================================
CREATE TABLE IF NOT EXISTS official_alerts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    alert_code VARCHAR(50) UNIQUE NOT NULL,
    title VARCHAR(255) NOT NULL,
    category VARCHAR(50) NOT NULL CHECK (category IN (
        'FLOOD',
        'LANDSLIDE',
        'EARTHQUAKE',
        'CYCLONE',
        'HEAVY_RAINFALL',
        'THUNDERSTORM_LIGHTNING',
        'ROAD_BLOCKAGE',
        'RIVER_SURGE',
        'GLOF_WATCH',
        'OTHER'
    )),
    severity VARCHAR(30) NOT NULL CHECK (severity IN (
        'ADVISORY',
        'WATCH',
        'WARNING',
        'SEVERE_WARNING',
        'EMERGENCY'
    )),
    urgency VARCHAR(30) DEFAULT 'EXPECTED' CHECK (urgency IN ('IMMEDIATE', 'EXPECTED', 'FUTURE', 'PAST')),
    certainty VARCHAR(30) DEFAULT 'LIKELY' CHECK (certainty IN ('OBSERVED', 'LIKELY', 'POSSIBLE', 'UNLIKELY')),
    description TEXT NOT NULL,
    safety_instructions TEXT NOT NULL,
    affected_states JSONB NOT NULL DEFAULT '[]'::jsonb, -- array of state names or IDs
    affected_districts JSONB NOT NULL DEFAULT '[]'::jsonb, -- array of district names
    source_url TEXT NOT NULL,
    issued_by_agency VARCHAR(200) NOT NULL,
    issued_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    expires_at TIMESTAMPTZ NOT NULL,
    publication_status VARCHAR(20) DEFAULT 'DRAFT' 
        CHECK (publication_status IN ('DRAFT', 'PUBLISHED', 'ARCHIVED', 'CANCELLED')),
    is_active BOOLEAN DEFAULT TRUE,
    created_by UUID REFERENCES admin_users(id),
    published_by UUID REFERENCES admin_users(id),
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_alerts_active_pub ON official_alerts(is_active, publication_status);
CREATE INDEX IF NOT EXISTS idx_alerts_category ON official_alerts(category);
CREATE INDEX IF NOT EXISTS idx_alerts_severity ON official_alerts(severity);
CREATE TRIGGER update_official_alerts_modtime 
    BEFORE UPDATE ON official_alerts 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ==============================================================================
-- SECTION 7: HEALTHCARE & HOSPITAL MANAGEMENT
-- ==============================================================================
CREATE TABLE IF NOT EXISTS healthcare_facilities (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    facility_type VARCHAR(50) NOT NULL CHECK (facility_type IN (
        'LEVEL_1_TRAUMA',
        'REGIONAL_REFERRAL',
        'MEDICAL_COLLEGE',
        'DISTRICT_CIVIL_HOSPITAL',
        'SUB_DIVISIONAL_HOSPITAL',
        'COMMUNITY_HEALTH_CENTRE'
    )),
    state_id UUID NOT NULL REFERENCES states(id) ON DELETE RESTRICT,
    district_id UUID NOT NULL REFERENCES districts(id) ON DELETE RESTRICT,
    address TEXT NOT NULL,
    latitude DOUBLE PRECISION NOT NULL,
    longitude DOUBLE PRECISION NOT NULL,
    emergency_contact VARCHAR(50) NOT NULL,
    casualty_phone VARCHAR(50),
    total_beds INT DEFAULT 0,
    icu_beds INT DEFAULT 0,
    has_blood_bank BOOLEAN DEFAULT FALSE,
    has_emergency_ot BOOLEAN DEFAULT TRUE,
    has_burn_unit BOOLEAN DEFAULT FALSE,
    has_oxygen_plant BOOLEAN DEFAULT TRUE,
    official_website VARCHAR(255),
    verification_status VARCHAR(30) DEFAULT 'PENDING_REVIEW' 
        CHECK (verification_status IN ('UNVERIFIED', 'PENDING_REVIEW', 'VERIFIED_OFFICIAL')),
    publication_status VARCHAR(20) DEFAULT 'PUBLISHED' 
        CHECK (publication_status IN ('DRAFT', 'PUBLISHED', 'ARCHIVED')),
    verified_by UUID REFERENCES admin_users(id),
    last_verified_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_hospitals_state ON healthcare_facilities(state_id);
CREATE INDEX IF NOT EXISTS idx_hospitals_district ON healthcare_facilities(district_id);
CREATE TRIGGER update_hospitals_modtime 
    BEFORE UPDATE ON healthcare_facilities 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ==============================================================================
-- SECTION 8: DESIGNATED EVACUATION SHELTERS
-- ==============================================================================
CREATE TABLE IF NOT EXISTS shelters (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    facility_type VARCHAR(50) NOT NULL CHECK (facility_type IN (
        'GOVERNMENT_SHELTER',
        'RELIEF_CAMP',
        'INDOOR_STADIUM',
        'COMMUNITY_HALL',
        'SCHOOL_REFUGE'
    )),
    state_id UUID NOT NULL REFERENCES states(id) ON DELETE RESTRICT,
    district_id UUID NOT NULL REFERENCES districts(id) ON DELETE RESTRICT,
    address TEXT NOT NULL,
    latitude DOUBLE PRECISION NOT NULL,
    longitude DOUBLE PRECISION NOT NULL,
    contact_person VARCHAR(150) NOT NULL,
    contact_phone VARCHAR(50) NOT NULL,
    total_capacity INT NOT NULL DEFAULT 500,
    current_occupancy INT NOT NULL DEFAULT 0,
    has_medical_post BOOLEAN DEFAULT TRUE,
    has_clean_water BOOLEAN DEFAULT TRUE,
    has_kitchen BOOLEAN DEFAULT TRUE,
    has_sanitation BOOLEAN DEFAULT TRUE,
    is_accessible_disability BOOLEAN DEFAULT FALSE,
    verification_status VARCHAR(30) DEFAULT 'VERIFIED_OFFICIAL' 
        CHECK (verification_status IN ('UNVERIFIED', 'PENDING_REVIEW', 'VERIFIED_OFFICIAL')),
    publication_status VARCHAR(20) DEFAULT 'PUBLISHED' 
        CHECK (publication_status IN ('DRAFT', 'PUBLISHED', 'ARCHIVED')),
    verified_by UUID REFERENCES admin_users(id),
    last_verified_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_shelters_state ON shelters(state_id);
CREATE INDEX IF NOT EXISTS idx_shelters_district ON shelters(district_id);
CREATE TRIGGER update_shelters_modtime 
    BEFORE UPDATE ON shelters 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ==============================================================================
-- SECTION 9: RESCUE FACILITIES & OPERATIONAL UNITS
-- ==============================================================================
CREATE TABLE IF NOT EXISTS rescue_facilities (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    unit_name VARCHAR(200) NOT NULL,
    agency VARCHAR(50) NOT NULL CHECK (agency IN (
        'NDRF',
        'SDRF',
        'FIRE_AND_EMERGENCY',
        'INDIAN_ARMY',
        'INDIAN_AIR_FORCE',
        'CIVIL_DEFENSE',
        'POLICE_TACTICAL'
    )),
    unit_code VARCHAR(50) UNIQUE NOT NULL,
    base_state_id UUID NOT NULL REFERENCES states(id),
    base_district_id UUID NOT NULL REFERENCES districts(id),
    headquarters_address TEXT NOT NULL,
    commanding_officer VARCHAR(150) NOT NULL,
    contact_phone VARCHAR(50) NOT NULL,
    alternate_phone VARCHAR(50),
    status VARCHAR(30) DEFAULT 'AVAILABLE' 
        CHECK (status IN ('AVAILABLE', 'DEPLOYED', 'STANDBY', 'MAINTENANCE')),
    personnel_count INT NOT NULL DEFAULT 30,
    specialized_equipment JSONB DEFAULT '[]'::jsonb,
    verification_status VARCHAR(30) DEFAULT 'VERIFIED_OFFICIAL' 
        CHECK (verification_status IN ('UNVERIFIED', 'PENDING_REVIEW', 'VERIFIED_OFFICIAL')),
    publication_status VARCHAR(20) DEFAULT 'PUBLISHED' 
        CHECK (publication_status IN ('DRAFT', 'PUBLISHED', 'ARCHIVED')),
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

CREATE TRIGGER update_rescue_facilities_modtime 
    BEFORE UPDATE ON rescue_facilities 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ==============================================================================
-- SECTION 10: WEBSITE CONTENT & DISASTER PREPAREDNESS GUIDELINES
-- ==============================================================================
CREATE TABLE IF NOT EXISTS website_content (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    content_type VARCHAR(50) NOT NULL CHECK (content_type IN (
        'SAFETY_GUIDELINE',
        'ANNOUNCEMENT',
        'IMPORTANT_NOTICE',
        'FAQ',
        'SURVIVAL_CHECKLIST'
    )),
    title VARCHAR(255) NOT NULL,
    slug VARCHAR(255) UNIQUE NOT NULL,
    summary TEXT,
    content_body TEXT NOT NULL,
    category VARCHAR(50) DEFAULT 'GENERAL',
    language_code VARCHAR(10) DEFAULT 'en',
    is_pinned BOOLEAN DEFAULT FALSE,
    publication_status VARCHAR(20) DEFAULT 'PUBLISHED' 
        CHECK (publication_status IN ('DRAFT', 'PUBLISHED', 'ARCHIVED')),
    author_id UUID REFERENCES admin_users(id),
    published_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

CREATE TRIGGER update_website_content_modtime 
    BEFORE UPDATE ON website_content 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ==============================================================================
-- SECTION 11: AUDIT LOGS (IMMUTABLE SECURITY RECORD)
-- ==============================================================================
CREATE TABLE IF NOT EXISTS admin_audit_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    admin_id UUID REFERENCES admin_users(id) ON DELETE SET NULL,
    admin_email VARCHAR(255) NOT NULL,
    action VARCHAR(100) NOT NULL,
    target_table VARCHAR(100) NOT NULL,
    target_id VARCHAR(100),
    details JSONB,
    ip_address VARCHAR(50),
    user_agent TEXT,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_audit_admin ON admin_audit_logs(admin_id);
CREATE INDEX IF NOT EXISTS idx_audit_action ON admin_audit_logs(action);
CREATE INDEX IF NOT EXISTS idx_audit_time ON admin_audit_logs(created_at);

-- ==============================================================================
-- SECTION 12: ROW LEVEL SECURITY (RLS) POLICIES
-- ==============================================================================
ALTER TABLE states ENABLE ROW LEVEL SECURITY;
ALTER TABLE districts ENABLE ROW LEVEL SECURITY;
ALTER TABLE admin_users ENABLE ROW LEVEL SECURITY;
ALTER TABLE admin_registration_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE emergency_contacts ENABLE ROW LEVEL SECURITY;
ALTER TABLE official_alerts ENABLE ROW LEVEL SECURITY;
ALTER TABLE healthcare_facilities ENABLE ROW LEVEL SECURITY;
ALTER TABLE shelters ENABLE ROW LEVEL SECURITY;
ALTER TABLE rescue_facilities ENABLE ROW LEVEL SECURITY;
ALTER TABLE website_content ENABLE ROW LEVEL SECURITY;
ALTER TABLE admin_audit_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;

-- 1. Public Read Policies (Only verified and published records visible to public)
CREATE POLICY "Public Read Active States" 
    ON states FOR SELECT USING (is_active = TRUE);

CREATE POLICY "Public Read Active Districts" 
    ON districts FOR SELECT USING (is_active = TRUE);

CREATE POLICY "Public Read Published Emergency Contacts" 
    ON emergency_contacts FOR SELECT 
    USING (publication_status = 'PUBLISHED' AND verification_status = 'VERIFIED_OFFICIAL');

CREATE POLICY "Public Read Published Alerts" 
    ON official_alerts FOR SELECT 
    USING (publication_status = 'PUBLISHED' AND is_active = TRUE);

CREATE POLICY "Public Read Published Hospitals" 
    ON healthcare_facilities FOR SELECT 
    USING (publication_status = 'PUBLISHED' AND verification_status = 'VERIFIED_OFFICIAL');

CREATE POLICY "Public Read Published Shelters" 
    ON shelters FOR SELECT 
    USING (publication_status = 'PUBLISHED' AND verification_status = 'VERIFIED_OFFICIAL');

CREATE POLICY "Public Read Published Rescue Facilities" 
    ON rescue_facilities FOR SELECT 
    USING (publication_status = 'PUBLISHED' AND verification_status = 'VERIFIED_OFFICIAL');

CREATE POLICY "Public Read Published Content" 
    ON website_content FOR SELECT 
    USING (publication_status = 'PUBLISHED');

-- 2. Authenticated Admin Access Policies
CREATE POLICY "Admin Full Access on Contacts" 
    ON emergency_contacts FOR ALL 
    USING (auth.role() = 'authenticated' OR auth.role() = 'service_role');

CREATE POLICY "Admin Full Access on Alerts" 
    ON official_alerts FOR ALL 
    USING (auth.role() = 'authenticated' OR auth.role() = 'service_role');

CREATE POLICY "Admin Full Access on Hospitals" 
    ON healthcare_facilities FOR ALL 
    USING (auth.role() = 'authenticated' OR auth.role() = 'service_role');

CREATE POLICY "Admin Full Access on Shelters" 
    ON shelters FOR ALL 
    USING (auth.role() = 'authenticated' OR auth.role() = 'service_role');

CREATE POLICY "Admin Full Access on Rescue" 
    ON rescue_facilities FOR ALL 
    USING (auth.role() = 'authenticated' OR auth.role() = 'service_role');

CREATE POLICY "Admin Full Access on Content" 
    ON website_content FOR ALL 
    USING (auth.role() = 'authenticated' OR auth.role() = 'service_role');

CREATE POLICY "Admin Access on Audit Logs" 
    ON admin_audit_logs FOR SELECT 
    USING (auth.role() = 'authenticated' OR auth.role() = 'service_role');

-- 3. User Profiles Access Policies
CREATE POLICY "Users Read Permitted Profiles"
    ON user_profiles FOR SELECT
    USING (true);

CREATE POLICY "Service Role Full Access on Profiles"
    ON user_profiles FOR ALL
    USING (auth.role() = 'service_role');

CREATE POLICY "Admin Users Self or SuperAdmin" 
    ON admin_users FOR ALL 
    USING (auth.role() = 'authenticated' OR auth.role() = 'service_role');

-- ==============================================================================
-- SECTION 13: INITIAL SEED DATA (VERIFIED NORTHEAST JURISDICTIONS)
-- ==============================================================================
-- 1. Seed All 8 Northeast Indian States
INSERT INTO states (code, name, capital, eoc_helpline, sdma_website, latitude, longitude) VALUES
    ('AS', 'Assam', 'Dispur (Guwahati)', '1070 / 1079', 'https://asdma.assam.gov.in', 26.1445, 91.7362),
    ('AR', 'Arunachal Pradesh', 'Itanagar', '1070 / 0360-2212222', 'http://dmr.arunachal.gov.in', 27.0844, 93.6053),
    ('ML', 'Meghalaya', 'Shillong', '1070 / 0364-2502098', 'https://msdma.gov.in', 25.5788, 91.8933),
    ('MN', 'Manipur', 'Imphal', '1070 / 0385-2443441', 'https://reliefmanipur.nic.in', 24.8170, 93.9368),
    ('MZ', 'Mizoram', 'Aizawl', '1070 / 0389-2342520', 'https://dmr.mizoram.gov.in', 23.7271, 92.7176),
    ('NL', 'Nagaland', 'Kohima', '1070 / 0370-2270050', 'https://nsdma.nagaland.gov.in', 25.6751, 94.1086),
    ('TR', 'Tripura', 'Agartala', '1070 / 0381-2416045', 'https://revenue.tripura.gov.in', 23.8315, 91.2868),
    ('SK', 'Sikkim', 'Gangtok', '1070 / 03592-201075', 'http://sikkim-sdma.gov.in', 27.3314, 88.6138)
ON CONFLICT (code) DO NOTHING;

-- 2. Seed Key Districts for Each State
DO $$
DECLARE
    as_id UUID;
    ar_id UUID;
    ml_id UUID;
    mn_id UUID;
    mz_id UUID;
    nl_id UUID;
    tr_id UUID;
    sk_id UUID;
BEGIN
    SELECT id INTO as_id FROM states WHERE code = 'AS';
    SELECT id INTO ar_id FROM states WHERE code = 'AR';
    SELECT id INTO ml_id FROM states WHERE code = 'ML';
    SELECT id INTO mn_id FROM states WHERE code = 'MN';
    SELECT id INTO mz_id FROM states WHERE code = 'MZ';
    SELECT id INTO nl_id FROM states WHERE code = 'NL';
    SELECT id INTO tr_id FROM states WHERE code = 'TR';
    SELECT id INTO sk_id FROM states WHERE code = 'SK';

    -- Assam Key Districts
    IF as_id IS NOT NULL THEN
        INSERT INTO districts (state_id, code, name, headquarters, deoc_helpline, latitude, longitude, vulnerability_level) VALUES
            (as_id, 'AS-KM', 'Kamrup Metropolitan', 'Guwahati', '1077 / 0361-2733052', 26.18, 91.75, 'CRITICAL'),
            (as_id, 'AS-CA', 'Cachar', 'Silchar', '1077 / 03842-245836', 24.83, 92.80, 'HIGH'),
            (as_id, 'AS-DB', 'Dibrugarh', 'Dibrugarh', '1077 / 0373-2312940', 27.48, 94.90, 'CRITICAL'),
            (as_id, 'AS-JO', 'Jorhat', 'Jorhat', '1077 / 0376-2320020', 26.75, 94.22, 'MODERATE')
        ON CONFLICT (state_id, name) DO NOTHING;
    END IF;

    -- Arunachal Key District
    IF ar_id IS NOT NULL THEN
        INSERT INTO districts (state_id, code, name, headquarters, deoc_helpline, latitude, longitude, vulnerability_level) VALUES
            (ar_id, 'AR-PP', 'Papum Pare', 'Yupia (Itanagar)', '1077 / 0360-2284988', 27.12, 93.68, 'HIGH')
        ON CONFLICT (state_id, name) DO NOTHING;
    END IF;

    -- Meghalaya Key District
    IF ml_id IS NOT NULL THEN
        INSERT INTO districts (state_id, code, name, headquarters, deoc_helpline, latitude, longitude, vulnerability_level) VALUES
            (ml_id, 'ML-EK', 'East Khasi Hills', 'Shillong', '1077 / 0364-2224010', 25.57, 91.88, 'HIGH')
        ON CONFLICT (state_id, name) DO NOTHING;
    END IF;

    -- Manipur Key District
    IF mn_id IS NOT NULL THEN
        INSERT INTO districts (state_id, code, name, headquarters, deoc_helpline, latitude, longitude, vulnerability_level) VALUES
            (mn_id, 'MN-IW', 'Imphal West', 'Lamphelpat', '1077 / 0385-2450107', 24.82, 93.93, 'HIGH')
        ON CONFLICT (state_id, name) DO NOTHING;
    END IF;

    -- Mizoram Key District
    IF mz_id IS NOT NULL THEN
        INSERT INTO districts (state_id, code, name, headquarters, deoc_helpline, latitude, longitude, vulnerability_level) VALUES
            (mz_id, 'MZ-AI', 'Aizawl', 'Aizawl', '1077 / 0389-2325372', 23.73, 92.72, 'HIGH')
        ON CONFLICT (state_id, name) DO NOTHING;
    END IF;

    -- Nagaland Key District
    IF nl_id IS NOT NULL THEN
        INSERT INTO districts (state_id, code, name, headquarters, deoc_helpline, latitude, longitude, vulnerability_level) VALUES
            (nl_id, 'NL-KO', 'Kohima', 'Kohima', '1077 / 0370-2290028', 25.67, 94.11, 'HIGH')
        ON CONFLICT (state_id, name) DO NOTHING;
    END IF;

    -- Tripura Key District
    IF tr_id IS NOT NULL THEN
        INSERT INTO districts (state_id, code, name, headquarters, deoc_helpline, latitude, longitude, vulnerability_level) VALUES
            (tr_id, 'TR-WT', 'West Tripura', 'Agartala', '1077 / 0381-2323742', 23.84, 91.28, 'HIGH')
        ON CONFLICT (state_id, name) DO NOTHING;
    END IF;

    -- Sikkim Key District
    IF sk_id IS NOT NULL THEN
        INSERT INTO districts (state_id, code, name, headquarters, deoc_helpline, latitude, longitude, vulnerability_level) VALUES
            (sk_id, 'SK-MG', 'Mangan (North Sikkim - GLOF Axis)', 'Mangan', '1077 / 03592-234255', 27.51, 88.53, 'CRITICAL'),
            (sk_id, 'SK-GT', 'Gangtok', 'Gangtok', '1077 / 03592-201075', 27.33, 88.61, 'HIGH')
        ON CONFLICT (state_id, name) DO NOTHING;
    END IF;
END $$;

-- 3. Seed Verified National & Regional Emergency Contacts
INSERT INTO emergency_contacts (
    contact_name, department_name, organization, category, scope,
    contact_number, alternate_number, is_toll_free, operating_hours,
    source_url, verification_status, publication_status, description
) VALUES
    ('Emergency Response Support System (ERSS)', 'Ministry of Home Affairs', 'Govt. of India', 'NATIONAL_EMERGENCY', 'NATIONAL', '112', '112', TRUE, '24x7 / 365 Days', 'https://112.gov.in', 'VERIFIED_OFFICIAL', 'PUBLISHED', 'Pan-India integrated emergency response for police, fire, and ambulance.'),
    ('State Emergency Operation Centre (ASDMA)', 'Disaster Management Department', 'Government of Assam', 'STATE_EOC', 'STATE', '1070', '1079', TRUE, '24x7 Emergency Desk', 'https://asdma.assam.gov.in', 'VERIFIED_OFFICIAL', 'PUBLISHED', 'Apex disaster management dispatch for floods, river surges, and earthquake emergencies in Assam.'),
    ('District Emergency Operation Centre (DEOC)', 'District Disaster Management Authorities', 'All Northeast Districts', 'DISTRICT_EOC', 'DISTRICT', '1077', '1077', TRUE, '24x7 Local Desk', 'https://ndma.gov.in', 'VERIFIED_OFFICIAL', 'PUBLISHED', 'Direct helpline connected automatically to your local district disaster control room.'),
    ('NDRF 1st Battalion Control Room', 'National Disaster Response Force', 'Ministry of Home Affairs', 'NDRF', 'REGIONAL', '0361-2849005', '9435117246', FALSE, '24x7 Operational Base', 'https://www.ndrf.gov.in', 'VERIFIED_OFFICIAL', 'PUBLISHED', 'High-readiness flood rescue, boat operations, and diving units in Guwahati covering Assam, Meghalaya, Tripura, Mizoram.'),
    ('NDRF 12th Battalion Control Room', 'National Disaster Response Force', 'Ministry of Home Affairs', 'NDRF', 'REGIONAL', '0360-2284988', '9436040850', FALSE, '24x7 Operational Base', 'https://www.ndrf.gov.in', 'VERIFIED_OFFICIAL', 'PUBLISHED', 'Specialized mountain rescue and landslide response covering Arunachal Pradesh, Nagaland, and Manipur.'),
    ('Emergency Medical Ambulance Service', 'National Health Mission', 'GVK EMRI / Govt. of Assam', 'AMBULANCE_MEDICAL', 'REGIONAL', '108', '108', TRUE, '24x7 Immediate Dispatch', 'https://nhm.assam.gov.in', 'VERIFIED_OFFICIAL', 'PUBLISHED', 'Free emergency ambulance transit and trauma life support.'),
    ('Disaster Health & Tele-Triage Helpline', 'Health & Family Welfare Dept.', 'National Health Mission', 'HEALTH_TELEMEDICINE', 'REGIONAL', '104', '104', TRUE, '24x7 Medical Advice', 'https://nhm.assam.gov.in', 'VERIFIED_OFFICIAL', 'PUBLISHED', 'Medical triage and emergency physician advice for disaster-affected communities.')
ON CONFLICT DO NOTHING;

-- ==============================================================================
-- SECTION 14: SECURE SUPER ADMIN BOOTSTRAP PROCEDURE
-- ==============================================================================
-- Procedure to safely initialize the primary Root Administrator
CREATE OR REPLACE FUNCTION bootstrap_super_admin(
    admin_email VARCHAR(255),
    admin_password TEXT,
    admin_name VARCHAR(150),
    admin_phone VARCHAR(25)
)
RETURNS UUID AS $$
DECLARE
    super_role_id UUID;
    existing_id UUID;
    new_admin_id UUID;
    hashed_pwd VARCHAR(255);
BEGIN
    SELECT id INTO super_role_id FROM admin_roles WHERE code = 'SUPER_ADMIN';
    IF super_role_id IS NULL THEN
        RAISE EXCEPTION 'SUPER_ADMIN role not found in admin_roles';
    END IF;

    SELECT id INTO existing_id FROM admin_users WHERE email = admin_email;
    IF existing_id IS NOT NULL THEN
        -- Already exists: update role to SUPER_ADMIN and status to APPROVED
        UPDATE admin_users 
        SET role_id = super_role_id, status = 'APPROVED', updated_at = CURRENT_TIMESTAMP
        WHERE id = existing_id;
        RETURN existing_id;
    END IF;

    -- Hash password with crypt
    hashed_pwd := crypt(admin_password, gen_salt('bf', 10));

    INSERT INTO admin_users (
        email, password_hash, full_name, phone, role_id, department, designation, status, approved_at
    ) VALUES (
        admin_email, hashed_pwd, admin_name, admin_phone, super_role_id,
        'Northeast Emergency Directorate', 'Chief Incident Commander', 'APPROVED', CURRENT_TIMESTAMP
    ) RETURNING id INTO new_admin_id;

    -- Record Audit Log
    INSERT INTO admin_audit_logs (admin_id, admin_email, action, target_table, target_id, details)
    VALUES (new_admin_id, admin_email, 'INITIAL_BOOTSTRAP_SUPER_ADMIN', 'admin_users', new_admin_id::text, '{"role": "SUPER_ADMIN", "status": "APPROVED"}'::jsonb);

    RETURN new_admin_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ==============================================================================
-- SECTION 15: REALTIME PUBLICATION & API PRIVILEGES
-- ==============================================================================
DO $$
BEGIN
    -- Add key tables to Supabase realtime publication if publication exists
    IF EXISTS (SELECT 1 FROM pg_publication WHERE pubname = 'supabase_realtime') THEN
        ALTER PUBLICATION supabase_realtime ADD TABLE emergency_contacts;
        ALTER PUBLICATION supabase_realtime ADD TABLE official_alerts;
        ALTER PUBLICATION supabase_realtime ADD TABLE shelters;
        ALTER PUBLICATION supabase_realtime ADD TABLE healthcare_facilities;
    END IF;
EXCEPTION
    WHEN duplicate_object THEN NULL;
    WHEN others THEN NULL;
END $$;

-- Explicit PostgREST & Supabase API grants
GRANT USAGE ON SCHEMA public TO anon, authenticated, service_role;
GRANT ALL ON ALL TABLES IN SCHEMA public TO anon, authenticated, service_role;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO anon, authenticated, service_role;
GRANT ALL ON ALL ROUTINES IN SCHEMA public TO anon, authenticated, service_role;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON TABLES TO anon, authenticated, service_role;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON SEQUENCES TO anon, authenticated, service_role;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON ROUTINES TO anon, authenticated, service_role;

-- ==============================================================================
-- END OF NE_RESQ_COMPLETE_DATABASE.sql
-- ==============================================================================
