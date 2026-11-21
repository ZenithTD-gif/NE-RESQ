-- ==============================================================================
-- NE-RESQ: Northeast Emergency Response, Disaster Intelligence & Safety Platform
-- Production PostgreSQL + PostGIS Schema Migration
-- Migration 001: Initial Complete Relational Schema
-- ==============================================================================

-- Enable UUID and PostGIS extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "postgis";

-- 1. States & Districts Reference Tables
CREATE TABLE IF NOT EXISTS states (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    code VARCHAR(10) UNIQUE NOT NULL, -- e.g. AS, AR, ML, MN, MZ, NL, TR, SK
    name VARCHAR(100) NOT NULL,
    capital VARCHAR(100) NOT NULL,
    eoc_helpline VARCHAR(50) NOT NULL,
    sdma_website VARCHAR(255),
    latitude DOUBLE PRECISION NOT NULL,
    longitude DOUBLE PRECISION NOT NULL,
    boundary_geom GEOMETRY(MultiPolygon, 4326),
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS districts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    state_id UUID NOT NULL REFERENCES states(id) ON DELETE CASCADE,
    code VARCHAR(20) NOT NULL,
    name VARCHAR(100) NOT NULL,
    headquarters VARCHAR(100) NOT NULL,
    deoc_helpline VARCHAR(50) NOT NULL,
    latitude DOUBLE PRECISION NOT NULL,
    longitude DOUBLE PRECISION NOT NULL,
    vulnerability_level VARCHAR(20) DEFAULT 'MODERATE' CHECK (vulnerability_level IN ('LOW', 'MODERATE', 'HIGH', 'CRITICAL')),
    boundary_geom GEOMETRY(MultiPolygon, 4326),
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(state_id, name)
);

CREATE INDEX IF NOT EXISTS idx_districts_state ON districts(state_id);

-- 2. Users, Profiles, Roles, and Role Permissions
CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email VARCHAR(255) UNIQUE,
    phone VARCHAR(20) UNIQUE,
    password_hash VARCHAR(255),
    full_name VARCHAR(150) NOT NULL,
    is_phone_verified BOOLEAN DEFAULT FALSE,
    is_email_verified BOOLEAN DEFAULT FALSE,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS user_roles (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(50) UNIQUE NOT NULL,
    description TEXT,
    tier_level INT DEFAULT 10 -- 1 = SuperAdmin, 2 = StateAdmin, 3 = DistrictAdmin, etc.
);

CREATE TABLE IF NOT EXISTS role_permissions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    role_id UUID NOT NULL REFERENCES user_roles(id) ON DELETE CASCADE,
    permission_key VARCHAR(100) NOT NULL,
    resource VARCHAR(100) NOT NULL,
    action VARCHAR(50) NOT NULL, -- READ, WRITE, APPROVE, DISPATCH, MANAGE
    UNIQUE(role_id, permission_key)
);

CREATE TABLE IF NOT EXISTS user_profiles (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID UNIQUE NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    role_id UUID NOT NULL REFERENCES user_roles(id),
    state_id UUID REFERENCES states(id),
    district_id UUID REFERENCES districts(id),
    official_designation VARCHAR(150),
    department VARCHAR(150),
    badge_number VARCHAR(100),
    verification_status VARCHAR(30) DEFAULT 'PENDING' CHECK (verification_status IN ('PENDING', 'VERIFIED', 'REJECTED')),
    emergency_contact VARCHAR(20),
    preferred_language VARCHAR(20) DEFAULT 'en',
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- 3. Disaster Events, Official Alerts, and Alert Sources
CREATE TABLE IF NOT EXISTS alert_sources (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    source_code VARCHAR(50) UNIQUE NOT NULL, -- e.g. IMD, NDMA_SACHET, CWC, ISRO_NRSC, ASDMA
    name VARCHAR(150) NOT NULL,
    organization VARCHAR(200) NOT NULL,
    api_endpoint VARCHAR(255),
    is_active BOOLEAN DEFAULT FALSE,
    requires_auth BOOLEAN DEFAULT TRUE,
    status_message VARCHAR(255) DEFAULT 'Service not connected — configuration required.',
    last_synced_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS disaster_events (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    event_code VARCHAR(100) UNIQUE NOT NULL,
    type VARCHAR(50) NOT NULL, -- FLOOD, FLASH_FLOOD, LANDSLIDE, HEAVY_RAINFALL, CYCLONE, EARTHQUAKE, ROAD_BLOCKAGE
    severity VARCHAR(20) NOT NULL CHECK (severity IN ('ADVISORY', 'WATCH', 'WARNING', 'SEVERE_WARNING', 'EMERGENCY')),
    state_id UUID NOT NULL REFERENCES states(id),
    district_id UUID REFERENCES districts(id),
    title VARCHAR(255) NOT NULL,
    description TEXT,
    affected_radius_km DOUBLE PRECISION,
    center_location GEOMETRY(Point, 4326),
    latitude DOUBLE PRECISION NOT NULL,
    longitude DOUBLE PRECISION NOT NULL,
    started_at TIMESTAMPTZ NOT NULL,
    ended_at TIMESTAMPTZ,
    status VARCHAR(30) DEFAULT 'ACTIVE' CHECK (status IN ('ACTIVE', 'CONTAINED', 'RESOLVED', 'CLOSED')),
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS official_alerts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    source_id UUID NOT NULL REFERENCES alert_sources(id),
    disaster_event_id UUID REFERENCES disaster_events(id),
    alert_title VARCHAR(255) NOT NULL,
    disaster_category VARCHAR(50) NOT NULL,
    severity VARCHAR(20) NOT NULL CHECK (severity IN ('ADVISORY', 'WATCH', 'WARNING', 'SEVERE_WARNING', 'EMERGENCY')),
    state_id UUID NOT NULL REFERENCES states(id),
    district_id UUID REFERENCES districts(id),
    affected_area VARCHAR(255) NOT NULL,
    issuing_authority VARCHAR(150) NOT NULL,
    issued_at TIMESTAMPTZ NOT NULL,
    valid_until TIMESTAMPTZ NOT NULL,
    original_source_url VARCHAR(500),
    recommended_action TEXT NOT NULL,
    verification_status VARCHAR(30) DEFAULT 'OFFICIAL_VERIFIED' CHECK (verification_status IN ('OFFICIAL_VERIFIED', 'PROVISIONAL', 'EXPIRED', 'REVOKED')),
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_alerts_state ON official_alerts(state_id);
CREATE INDEX IF NOT EXISTS idx_alerts_active ON official_alerts(is_active, valid_until);

-- 4. Weather Observations, Rainfall, River Water Levels & Gauges
CREATE TABLE IF NOT EXISTS weather_observations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    district_id UUID NOT NULL REFERENCES districts(id),
    station_name VARCHAR(150) NOT NULL,
    temperature_celsius DOUBLE PRECISION,
    humidity_percent DOUBLE PRECISION,
    wind_speed_kmh DOUBLE PRECISION,
    wind_direction VARCHAR(20),
    pressure_hpa DOUBLE PRECISION,
    observation_time TIMESTAMPTZ NOT NULL,
    source_name VARCHAR(100) DEFAULT 'IMD_STATION',
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS rainfall_observations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    district_id UUID NOT NULL REFERENCES districts(id),
    rainfall_1h_mm DOUBLE PRECISION,
    rainfall_24h_mm DOUBLE PRECISION,
    accumulation_72h_mm DOUBLE PRECISION,
    observation_time TIMESTAMPTZ NOT NULL,
    risk_level VARCHAR(20) DEFAULT 'NORMAL' CHECK (risk_level IN ('NORMAL', 'HEAVY', 'VERY_HEAVY', 'EXTREMELY_HEAVY')),
    source_name VARCHAR(100) DEFAULT 'IMD_AWS',
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS river_gauges (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    river_name VARCHAR(100) NOT NULL, -- e.g. Brahmaputra, Barak, Subansiri, Teesta, Kopili, Dhansiri
    gauge_station_name VARCHAR(150) NOT NULL,
    state_id UUID NOT NULL REFERENCES states(id),
    district_id UUID NOT NULL REFERENCES districts(id),
    warning_level_meters DOUBLE PRECISION NOT NULL,
    danger_level_meters DOUBLE PRECISION NOT NULL,
    highest_flood_level_meters DOUBLE PRECISION,
    current_water_level_meters DOUBLE PRECISION,
    trend VARCHAR(20) CHECK (trend IN ('RISING', 'FALLING', 'STEADY')),
    status VARCHAR(30) DEFAULT 'NORMAL' CHECK (status IN ('NORMAL', 'ABOVE_WARNING', 'ABOVE_DANGER', 'CRITICAL_HIGH')),
    latitude DOUBLE PRECISION NOT NULL,
    longitude DOUBLE PRECISION NOT NULL,
    last_reported_at TIMESTAMPTZ,
    cwc_gauge_id VARCHAR(50),
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- 5. Risk Zones and Assessments
CREATE TABLE IF NOT EXISTS risk_zones (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    district_id UUID NOT NULL REFERENCES districts(id),
    zone_name VARCHAR(150) NOT NULL,
    hazard_type VARCHAR(50) NOT NULL, -- FLOOD, LANDSLIDE, RIVERBANK_EROSION
    susceptibility VARCHAR(20) NOT NULL CHECK (susceptibility IN ('LOW', 'MODERATE', 'HIGH', 'CRITICAL')),
    slope_degrees DOUBLE PRECISION,
    elevation_meters DOUBLE PRECISION,
    soil_type VARCHAR(100),
    historical_frequency INT DEFAULT 0,
    geometry GEOMETRY(Polygon, 4326),
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS risk_assessments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    district_id UUID NOT NULL REFERENCES districts(id),
    assessment_date DATE NOT NULL,
    flood_risk_score DOUBLE PRECISION NOT NULL CHECK (flood_risk_score BETWEEN 0 AND 100),
    landslide_risk_score DOUBLE PRECISION NOT NULL CHECK (landslide_risk_score BETWEEN 0 AND 100),
    overall_classification VARCHAR(20) NOT NULL CHECK (overall_classification IN ('LOW', 'MODERATE', 'HIGH', 'CRITICAL')),
    confidence_score DOUBLE PRECISION CHECK (confidence_score BETWEEN 0 AND 1),
    methodology VARCHAR(255) NOT NULL,
    input_factors JSONB,
    generated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- 6. SOS Requests and Rescue Management
CREATE TABLE IF NOT EXISTS sos_requests (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tracking_id VARCHAR(50) UNIQUE NOT NULL, -- e.g. NER-2026-XXXXX
    citizen_name VARCHAR(150) NOT NULL,
    contact_phone VARCHAR(20) NOT NULL,
    alternate_phone VARCHAR(20),
    category VARCHAR(50) NOT NULL CHECK (category IN (
        'FLOOD_RESCUE', 'LANDSLIDE_RESCUE', 'MEDICAL_EMERGENCY',
        'MISSING_PERSON', 'FOOD_REQUIREMENT', 'DRINKING_WATER_REQUIREMENT',
        'SHELTER_REQUIREMENT', 'STRANDED_PERSON', 'OTHER_EMERGENCY'
    )),
    state_id UUID REFERENCES states(id),
    district_id UUID REFERENCES districts(id),
    location_address TEXT NOT NULL,
    latitude DOUBLE PRECISION NOT NULL,
    longitude DOUBLE PRECISION NOT NULL,
    location_geom GEOMETRY(Point, 4326),
    affected_count INT DEFAULT 1,
    children_count INT DEFAULT 0,
    elderly_count INT DEFAULT 0,
    has_medical_emergency BOOLEAN DEFAULT FALSE,
    medical_details TEXT,
    has_accessibility_needs BOOLEAN DEFAULT FALSE,
    accessibility_details TEXT,
    additional_notes TEXT,
    status VARCHAR(40) DEFAULT 'SUBMITTED' CHECK (status IN (
        'SUBMITTED', 'AWAITING_VERIFICATION', 'VERIFIED',
        'ASSIGNED', 'ACCEPTED_BY_TEAM', 'RESCUE_IN_PROGRESS',
        'ASSISTANCE_PROVIDED', 'CLOSED', 'CANCELLED'
    )),
    priority_level VARCHAR(20) DEFAULT 'HIGH' CHECK (priority_level IN ('MEDIUM', 'HIGH', 'CRITICAL_LIFE_THREATENING')),
    is_offline_synced BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_sos_status ON sos_requests(status);
CREATE INDEX IF NOT EXISTS idx_sos_tracking ON sos_requests(tracking_id);
CREATE INDEX IF NOT EXISTS idx_sos_geom ON sos_requests USING GIST(location_geom);

CREATE TABLE IF NOT EXISTS sos_attachments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    sos_id UUID NOT NULL REFERENCES sos_requests(id) ON DELETE CASCADE,
    file_type VARCHAR(50) NOT NULL, -- IMAGE, VIDEO, AUDIO
    file_path VARCHAR(500) NOT NULL,
    file_size_bytes BIGINT,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- 7. Rescue Teams, Members, Assignments & Audit History
CREATE TABLE IF NOT EXISTS rescue_teams (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    team_name VARCHAR(150) NOT NULL,
    agency_type VARCHAR(50) NOT NULL, -- NDRF, SDRF, CIVIL_DEFENCE, POLICE, FIRE_SERVICE, ARMY
    unit_identifier VARCHAR(100) NOT NULL,
    base_state_id UUID NOT NULL REFERENCES states(id),
    base_district_id UUID NOT NULL REFERENCES districts(id),
    leader_name VARCHAR(150) NOT NULL,
    leader_phone VARCHAR(20) NOT NULL,
    total_personnel INT DEFAULT 10,
    available_boats INT DEFAULT 0,
    available_ambulances INT DEFAULT 0,
    status VARCHAR(30) DEFAULT 'AVAILABLE' CHECK (status IN ('AVAILABLE', 'DISPATCHED', 'ON_MISSION', 'RESTING', 'UNAVAILABLE')),
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS rescue_members (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    team_id UUID NOT NULL REFERENCES rescue_teams(id) ON DELETE CASCADE,
    user_id UUID REFERENCES users(id),
    name VARCHAR(150) NOT NULL,
    rank_or_role VARCHAR(100) NOT NULL,
    phone VARCHAR(20) NOT NULL,
    specialization VARCHAR(100), -- DEEP_DIVER, PARAMEDIC, DRONE_OPERATOR, ROPE_RESCUER
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS rescue_assignments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    sos_id UUID NOT NULL REFERENCES sos_requests(id) ON DELETE CASCADE,
    rescue_team_id UUID NOT NULL REFERENCES rescue_teams(id),
    assigned_by_user_id UUID REFERENCES users(id),
    assignment_status VARCHAR(40) DEFAULT 'ASSIGNED' CHECK (assignment_status IN (
        'ASSIGNED', 'ACCEPTED', 'REJECTED', 'EN_ROUTE', 'ON_SITE', 'COMPLETED', 'ABORTED'
    )),
    assigned_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    responded_at TIMESTAMPTZ,
    arrival_at TIMESTAMPTZ,
    completed_at TIMESTAMPTZ,
    rejection_reason TEXT,
    operation_notes TEXT
);

CREATE TABLE IF NOT EXISTS rescue_status_history (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    sos_id UUID NOT NULL REFERENCES sos_requests(id) ON DELETE CASCADE,
    previous_status VARCHAR(40),
    new_status VARCHAR(40) NOT NULL,
    changed_by_user_id UUID REFERENCES users(id),
    remarks TEXT,
    timestamp TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- 8. Shelters, Hospitals & Emergency Facilities
CREATE TABLE IF NOT EXISTS shelters (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(200) NOT NULL,
    facility_type VARCHAR(50) DEFAULT 'GOVERNMENT_SHELTER' CHECK (facility_type IN (
        'RELIEF_CAMP', 'GOVERNMENT_SHELTER', 'SCHOOL_SHELTER', 'COMMUNITY_HALL'
    )),
    state_id UUID NOT NULL REFERENCES states(id),
    district_id UUID NOT NULL REFERENCES districts(id),
    address TEXT NOT NULL,
    latitude DOUBLE PRECISION NOT NULL,
    longitude DOUBLE PRECISION NOT NULL,
    location_geom GEOMETRY(Point, 4326),
    contact_person VARCHAR(150) NOT NULL,
    contact_phone VARCHAR(20) NOT NULL,
    total_capacity INT NOT NULL,
    current_occupancy INT DEFAULT 0,
    has_medical_post BOOLEAN DEFAULT FALSE,
    has_clean_water BOOLEAN DEFAULT TRUE,
    has_kitchen BOOLEAN DEFAULT TRUE,
    has_sanitation BOOLEAN DEFAULT TRUE,
    is_accessible_disability BOOLEAN DEFAULT FALSE,
    verification_status VARCHAR(30) DEFAULT 'VERIFIED' CHECK (verification_status IN ('VERIFIED', 'UNVERIFIED', 'CLOSED')),
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS shelter_capacity_history (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    shelter_id UUID NOT NULL REFERENCES shelters(id) ON DELETE CASCADE,
    occupancy INT NOT NULL,
    recorded_by_user_id UUID REFERENCES users(id),
    recorded_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS healthcare_facilities (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(200) NOT NULL,
    facility_type VARCHAR(50) NOT NULL, -- CIVIL_HOSPITAL, PHC, CHC, MEDICAL_COLLEGE, BLOOD_BANK
    state_id UUID NOT NULL REFERENCES states(id),
    district_id UUID NOT NULL REFERENCES districts(id),
    address TEXT NOT NULL,
    latitude DOUBLE PRECISION NOT NULL,
    longitude DOUBLE PRECISION NOT NULL,
    contact_phone VARCHAR(50) NOT NULL,
    icu_beds_total INT DEFAULT 0,
    icu_beds_available INT DEFAULT 0,
    emergency_24x7 BOOLEAN DEFAULT TRUE,
    ambulance_available BOOLEAN DEFAULT TRUE,
    verification_status VARCHAR(30) DEFAULT 'VERIFIED',
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS emergency_facilities (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(200) NOT NULL,
    facility_type VARCHAR(50) NOT NULL, -- POLICE_STATION, FIRE_STATION, WATER_SUPPLY, RELIEF_DISTRIBUTION
    state_id UUID NOT NULL REFERENCES states(id),
    district_id UUID NOT NULL REFERENCES districts(id),
    address TEXT NOT NULL,
    latitude DOUBLE PRECISION NOT NULL,
    longitude DOUBLE PRECISION NOT NULL,
    contact_phone VARCHAR(50) NOT NULL,
    verification_status VARCHAR(30) DEFAULT 'VERIFIED',
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- 9. Road Closures & Evacuation Routes
CREATE TABLE IF NOT EXISTS road_closures (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    state_id UUID NOT NULL REFERENCES states(id),
    district_id UUID NOT NULL REFERENCES districts(id),
    road_name VARCHAR(255) NOT NULL, -- e.g. NH-27, NH-715, Guwahati-Shillong Road
    blockage_reason VARCHAR(50) NOT NULL CHECK (blockage_reason IN ('FLOODING', 'LANDSLIDE', 'BRIDGE_DAMAGE', 'FALLEN_TREES', 'EROSION')),
    latitude DOUBLE PRECISION NOT NULL,
    longitude DOUBLE PRECISION NOT NULL,
    reported_at TIMESTAMPTZ NOT NULL,
    expected_clearance TIMESTAMPTZ,
    status VARCHAR(30) DEFAULT 'CLOSED' CHECK (status IN ('CLOSED', 'PARTIALLY_OPEN', 'CLEARED')),
    alternate_route_advice TEXT,
    verified_by_authority VARCHAR(150),
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS evacuation_routes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    route_name VARCHAR(255) NOT NULL,
    origin_area VARCHAR(255) NOT NULL,
    destination_shelter_id UUID REFERENCES shelters(id),
    district_id UUID NOT NULL REFERENCES districts(id),
    route_polyline TEXT, -- GeoJSON or polyline
    is_safe BOOLEAN DEFAULT TRUE,
    status_notes TEXT,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- 10. Community Reports & AI-Assisted Verifications
CREATE TABLE IF NOT EXISTS community_reports (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    report_code VARCHAR(50) UNIQUE NOT NULL,
    reporter_name VARCHAR(150),
    reporter_phone VARCHAR(20),
    is_anonymous BOOLEAN DEFAULT FALSE,
    category VARCHAR(50) NOT NULL CHECK (category IN (
        'FLOODING', 'LANDSLIDE', 'DAMAGED_ROAD', 'BRIDGE_DAMAGE',
        'BLOCKED_ROAD', 'MISSING_PERSON', 'STRANDED_RESIDENTS',
        'DAMAGED_INFRASTRUCTURE', 'FOOD_WATER_SHORTAGE', 'OTHER_EMERGENCY'
    )),
    state_id UUID REFERENCES states(id),
    district_id UUID REFERENCES districts(id),
    location_description TEXT NOT NULL,
    latitude DOUBLE PRECISION NOT NULL,
    longitude DOUBLE PRECISION NOT NULL,
    media_url VARCHAR(500),
    media_type VARCHAR(50),
    status VARCHAR(30) DEFAULT 'UNVERIFIED' CHECK (status IN (
        'UNVERIFIED', 'UNDER_REVIEW', 'VERIFIED', 'REJECTED', 'RESOLVED'
    )),
    ai_duplicate_score DOUBLE PRECISION DEFAULT 0.0,
    ai_risk_tag VARCHAR(50),
    submitted_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS report_verifications (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    report_id UUID NOT NULL REFERENCES community_reports(id) ON DELETE CASCADE,
    verified_by_user_id UUID REFERENCES users(id),
    decision VARCHAR(30) NOT NULL CHECK (decision IN ('VERIFIED', 'REJECTED', 'DUPLICATE')),
    justification TEXT,
    verified_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- 11. Volunteers & NGOs
CREATE TABLE IF NOT EXISTS volunteers (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id),
    full_name VARCHAR(150) NOT NULL,
    phone VARCHAR(20) NOT NULL,
    email VARCHAR(255),
    state_id UUID NOT NULL REFERENCES states(id),
    preferred_district_id UUID NOT NULL REFERENCES districts(id),
    skills TEXT[] DEFAULT '{}', -- e.g. FIRST_AID, BOAT_ROWING, LOGISTICS, TRANSLATION, PSYCHOLOGICAL_SUPPORT
    availability_status VARCHAR(30) DEFAULT 'AVAILABLE' CHECK (availability_status IN ('AVAILABLE', 'DEPLOYED', 'ON_BREAK', 'UNAVAILABLE')),
    training_certifications TEXT,
    verification_status VARCHAR(30) DEFAULT 'PENDING' CHECK (verification_status IN ('PENDING', 'APPROVED', 'REJECTED')),
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS volunteer_assignments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    volunteer_id UUID NOT NULL REFERENCES volunteers(id) ON DELETE CASCADE,
    shelter_id UUID REFERENCES shelters(id),
    task_description TEXT NOT NULL,
    status VARCHAR(30) DEFAULT 'ASSIGNED' CHECK (status IN ('ASSIGNED', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED')),
    assigned_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    completed_at TIMESTAMPTZ
);

CREATE TABLE IF NOT EXISTS ngos (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_name VARCHAR(200) NOT NULL,
    registration_number VARCHAR(100) NOT NULL,
    contact_person VARCHAR(150) NOT NULL,
    contact_phone VARCHAR(20) NOT NULL,
    contact_email VARCHAR(255) NOT NULL,
    operating_state_ids UUID[] DEFAULT '{}',
    service_categories TEXT[] DEFAULT '{}', -- FOOD, MEDICAL_AID, SHELTER_SUPPORT, WATER_PURIFICATION
    verification_status VARCHAR(30) DEFAULT 'PENDING' CHECK (verification_status IN ('PENDING', 'VERIFIED', 'REJECTED')),
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- 12. Resource Inventory & Relief Management
CREATE TABLE IF NOT EXISTS resource_inventory (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    shelter_id UUID NOT NULL REFERENCES shelters(id) ON DELETE CASCADE,
    item_category VARCHAR(50) NOT NULL CHECK (item_category IN (
        'FOOD_PACKS', 'DRINKING_WATER_LITERS', 'MEDICINE_KITS', 'BLANKETS',
        'TARPAULIN_SHEETS', 'BABY_FOOD', 'SANITARY_KITS', 'LIFE_JACKETS'
    )),
    item_name VARCHAR(150) NOT NULL,
    quantity_available INT DEFAULT 0,
    unit VARCHAR(30) NOT NULL, -- PACKS, LITERS, PIECES, BOXES
    critical_threshold INT DEFAULT 20,
    last_restocked_at TIMESTAMPTZ,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS resource_transactions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    inventory_id UUID NOT NULL REFERENCES resource_inventory(id) ON DELETE CASCADE,
    transaction_type VARCHAR(20) NOT NULL CHECK (transaction_type IN ('INFLOW_STOCK', 'OUTFLOW_DISTRIBUTION', 'DISCARDED')),
    quantity INT NOT NULL,
    recorded_by_user_id UUID REFERENCES users(id),
    beneficiary_details TEXT,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS resource_requests (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    from_shelter_id UUID NOT NULL REFERENCES shelters(id),
    requested_item VARCHAR(150) NOT NULL,
    quantity_needed INT NOT NULL,
    urgency VARCHAR(20) DEFAULT 'HIGH' CHECK (urgency IN ('NORMAL', 'HIGH', 'CRITICAL')),
    status VARCHAR(30) DEFAULT 'REQUESTED' CHECK (status IN ('REQUESTED', 'APPROVED', 'DISPATCHED', 'FULFILLED', 'REJECTED')),
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- 13. Missing Persons & Family Reunification
CREATE TABLE IF NOT EXISTS missing_persons (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    case_number VARCHAR(50) UNIQUE NOT NULL,
    reported_by_user_id UUID REFERENCES users(id),
    reporter_name VARCHAR(150) NOT NULL,
    reporter_phone VARCHAR(20) NOT NULL,
    reporter_relationship VARCHAR(100),
    missing_person_name VARCHAR(150) NOT NULL,
    age INT,
    gender VARCHAR(20),
    state_id UUID NOT NULL REFERENCES states(id),
    district_id UUID NOT NULL REFERENCES districts(id),
    last_seen_location TEXT NOT NULL,
    last_seen_date TIMESTAMPTZ NOT NULL,
    physical_description TEXT,
    photo_url VARCHAR(500),
    case_status VARCHAR(30) DEFAULT 'ACTIVE_SEARCH' CHECK (case_status IN ('ACTIVE_SEARCH', 'TRACED_SAFE', 'HOSPITALIZED', 'CLOSED')),
    verification_status VARCHAR(30) DEFAULT 'UNDER_VERIFICATION' CHECK (verification_status IN ('UNDER_VERIFICATION', 'VERIFIED_CASE', 'CLOSED')),
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS reunification_cases (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    missing_person_id UUID NOT NULL REFERENCES missing_persons(id) ON DELETE CASCADE,
    matched_shelter_id UUID REFERENCES shelters(id),
    matched_hospital_id UUID REFERENCES healthcare_facilities(id),
    verification_notes TEXT NOT NULL,
    resolved_by_user_id UUID REFERENCES users(id),
    reunified_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- 14. Notifications & Deliveries
CREATE TABLE IF NOT EXISTS notifications (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    target_type VARCHAR(30) NOT NULL, -- ALL_CITIZENS, DISTRICT_CITIZENS, RESCUE_TEAMS, SHELTER_MANAGERS
    target_state_id UUID REFERENCES states(id),
    target_district_id UUID REFERENCES districts(id),
    title VARCHAR(255) NOT NULL,
    body TEXT NOT NULL,
    channel VARCHAR(30) NOT NULL, -- WEB_PUSH, SMS, IN_APP, EMAIL
    priority VARCHAR(20) DEFAULT 'URGENT' CHECK (priority IN ('NORMAL', 'HIGH', 'URGENT_EMERGENCY')),
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS notification_deliveries (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    notification_id UUID NOT NULL REFERENCES notifications(id) ON DELETE CASCADE,
    user_id UUID REFERENCES users(id),
    destination VARCHAR(255), -- phone or push endpoint
    status VARCHAR(20) DEFAULT 'PENDING' CHECK (status IN ('PENDING', 'SENT', 'DELIVERED', 'FAILED')),
    error_message TEXT,
    sent_at TIMESTAMPTZ
);

-- 15. AI Conversations, Provider Status & Audit Logs
CREATE TABLE IF NOT EXISTS ai_conversations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    session_id VARCHAR(100) NOT NULL,
    user_id UUID REFERENCES users(id),
    user_query TEXT NOT NULL,
    ai_response TEXT NOT NULL,
    safety_sources_cited JSONB,
    language_code VARCHAR(10) DEFAULT 'en',
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS data_provider_status (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    provider_name VARCHAR(100) UNIQUE NOT NULL, -- IMD_WEATHER, CWC_RIVER, NDMA_SACHET, ISRO_BHUVAN
    is_connected BOOLEAN DEFAULT FALSE,
    configuration_required BOOLEAN DEFAULT TRUE,
    connection_details TEXT,
    last_checked_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS audit_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id),
    action VARCHAR(100) NOT NULL,
    target_resource VARCHAR(100) NOT NULL,
    target_id VARCHAR(100),
    ip_address VARCHAR(50),
    metadata JSONB,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS system_settings (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    setting_key VARCHAR(100) UNIQUE NOT NULL,
    setting_value TEXT NOT NULL,
    description TEXT,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);
