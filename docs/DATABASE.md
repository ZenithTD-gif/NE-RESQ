# Database & PostGIS Architecture

## 1. Overview

NE-RESQ uses a PostgreSQL relational database with the **PostGIS** spatial extension (`postgis`, `uuid-ossp`).

The complete, production-ready schema migration is located at:  
[`database/migrations/001_initial_schema.sql`](file:///Users/tridipdeka/Documents/GU%20Hackathon%20/database/migrations/001_initial_schema.sql)

## 2. Table Summary (36 Entities)

### Identity, Access & Profiles
- `users`: Core account identity and authentication flags
- `user_roles`: 13 hierarchical system roles
- `role_permissions`: Granular resource-action bindings
- `user_profiles`: Official designations, departments, jurisdictions
- `audit_logs`: Immutable, append-only operational event history

### Geography & Reference
- `states`: 8 Northeast Indian states with capital coordinates and SEOC helplines
- `districts`: 124 Northeast districts with headquarters and DEOC helplines
- `risk_zones`: Polygons with slope, soil type, and susceptibility ratings

### Monitoring & External Ingestion
- `alert_sources`: Metadata, URLs, and authentication status for external providers
- `disaster_events`: High-level disaster incidents
- `official_alerts`: Broadcasted government advisories and warnings
- `weather_observations`: Temperature, pressure, humidity, wind observations
- `rainfall_observations`: 1-hour, 24-hour, and 72-hour rainfall accumulations
- `river_gauges`: CWC monitoring stations, warning levels, and danger levels

### Emergency Operations (SOS & Rescue)
- `sos_requests`: Unique tracking IDs, affected counts, coordinates, medical trauma flags
- `sos_attachments`: Secure media paths
- `rescue_teams`: NDRF/SDRF units, available boats, personnel counts
- `rescue_members`: Roster with specializations (deep divers, paramedics, drone operators)
- `rescue_assignments`: Operation links between SOS requests and rescue teams
- `rescue_status_history`: Append-only transition ledger with timestamps and actors

### Shelters & Facilities
- `shelters`: Relief camps, capacity, current occupancy, amenities
- `shelter_capacity_history`: Time-series headcount updates
- `healthcare_facilities`: Hospitals, PHCs, ICU beds, 24x7 emergency posts
- `emergency_facilities`: Police stations, fire stations, water supply depots
- `road_closures`: Highway closures, washed out bridges, clearance estimates
- `evacuation_routes`: Pre-mapped evacuation corridors

### Community & Relief
- `community_reports`: Crowdsourced incident reports with deduplication scores
- `report_verifications`: Official verification actions and decisions
- `volunteers` & `volunteer_assignments`: Community skills and task assignments
- `ngos`: Registered non-governmental relief organizations
- `resource_inventory`, `resource_transactions`, `resource_requests`: Camp supplies
- `missing_persons` & `reunification_cases`: Privacy-protected family tracing

### Spatial Indexes
Spatial columns use PostGIS `GEOMETRY(Point, 4326)` indexed with GiST:
```sql
CREATE INDEX idx_sos_geom ON sos_requests USING GIST(location_geom);
CREATE INDEX idx_shelters_geom ON shelters USING GIST(location_geom);
```
