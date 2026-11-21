# NE-RESQ --- Production Engineering & Deployment Specification

## Senior Developer Handoff Document for Antigravity

**Project:** NE-RESQ --- Northeast Emergency Response & Safety Platform\
**Domain:** North East Development & Disaster Management\
**Target geography:** All eight North-Eastern states of India\
**Deployment stack:** GitHub + Supabase + Vercel\
**Product type:** Production-oriented, multi-portal, full-stack disaster
intelligence and emergency response platform\
**Document purpose:** This document is the authoritative implementation
brief for Antigravity. Follow it as an engineering specification, not as
a suggestion to generate a visual mock-up.

------------------------------------------------------------------------

# 1. Executive direction

Build NE-RESQ as a secure, reliable and extensible digital platform that
helps people access verified disaster information, prepare for
emergencies, request assistance, find verified facilities, and helps
authorized organizations coordinate response and relief.

The platform must support:

1.  Citizens and public visitors.
2.  State and district authorities.
3.  Emergency control-room operators.
4.  Rescue coordinators and rescue teams.
5.  Shelter and facility managers.
6.  NGOs and relief organizations.
7.  Volunteers.
8.  Platform administrators.

The initial geographic scope is all eight North-Eastern states:

-   Assam
-   Arunachal Pradesh
-   Meghalaya
-   Manipur
-   Mizoram
-   Nagaland
-   Tripura
-   Sikkim

The platform is not an official government emergency dispatch service
unless and until formal integrations and operating agreements exist. Do
not imply government endorsement or live emergency-response capability
that has not been verified.

## 1.1 Non-negotiable product principles

-   Build a real full-stack application, not a static landing page.
-   Do not insert demo, seed, sample, fabricated or fictional
    operational data.
-   Do not invent live alerts, weather, river levels, hospitals,
    shelters, rescue teams, volunteers, road closures, emergency phone
    numbers or statistics.
-   Do not present synthetic data as real.
-   Do not create buttons or controls that do nothing.
-   Do not report an operation as dispatched, delivered, accepted or
    completed unless the backend has confirmed the relevant state
    transition.
-   When a service is not configured, show a clear unavailable/not
    configured state.
-   When a real data source has no records, show a well-designed empty
    state.
-   Preserve provenance: every externally sourced record must identify
    its provider, retrieval time and source timestamp when available.
-   Make safety, accuracy, privacy, accessibility and resilience more
    important than decorative effects.
-   Never block emergency information behind account registration.
-   Never expose sensitive personal information to unauthorized users.

## 1.2 Definition of production-ready

"Production-ready" means the codebase has production architecture, real
database persistence, real authentication and authorization, validated
workflows, secure configuration, automated tests, error handling,
monitoring hooks, migration scripts and deployment documentation.

It does **not** mean that government APIs, emergency agency agreements,
paid providers, field-verified shelter data or rescue dispatch
partnerships can be fabricated by code. External dependencies must be
clearly identified and remain disabled until genuinely configured and
authorized.

------------------------------------------------------------------------

# 2. Required working method for Antigravity

Act as a senior software architect, senior full-stack engineer, database
engineer, GIS developer, security engineer, 3D web developer, QA
engineer and DevOps engineer.

Before coding:

1.  Inspect the repository and existing project files.
2.  Identify the current framework, dependencies, scripts and existing
    functionality.
3.  Do not overwrite useful existing code without understanding it.
4.  Create an implementation plan and architecture decision record.
5.  Identify external dependencies that require credentials, licenses,
    approvals or data agreements.
6.  Create a phased delivery checklist.
7.  Start implementing; do not stop after providing a plan.

During development:

-   Work in small, testable vertical slices.
-   Run lint, type-check, unit tests and production builds after
    meaningful changes.
-   Fix errors before moving to the next phase.
-   Keep the application runnable throughout development.
-   Do not replace completed features with placeholders in later phases.
-   Use migrations for database changes.
-   Use typed API contracts and centralized validation.
-   Keep secrets out of source control.
-   Add loading, error, empty, offline and permission-denied states.
-   Add a test for each critical workflow.
-   Record any blocked integration and its exact missing dependency.

At the end of each phase, report: - What was implemented. - Files and
migrations added. - Tests executed and results. - Configuration still
required. - Known limitations. - Next phase.

Do not claim a task is complete merely because a page renders.

------------------------------------------------------------------------

# 3. Recommended technical architecture

Use a maintainable architecture compatible with GitHub, Supabase and
Vercel.

## 3.1 Primary stack

  -----------------------------------------------------------------------
  Layer                   Recommended technology  Responsibility
  ----------------------- ----------------------- -----------------------
  Web application         Next.js App Router +    Public site and
                          React + TypeScript      authenticated portals

  Styling                 Tailwind CSS            Responsive design
                                                  system

  Motion                  Framer Motion           UI transitions and
                                                  interactions

  3D                      Three.js + React Three  Selective 3D scenes and
                          Fiber + Drei            effects

  Mapping                 MapLibre GL JS          Interactive maps and
                                                  map layers

  Backend                 Next.js server-side     Secure server-side
                          routes/actions          application logic
                          initially               

  Optional separate       Python FastAPI          Geospatial processing
  services                                        and ML workloads when
                                                  justified

  Database                Supabase PostgreSQL     Relational and
                                                  operational data

  Geospatial              PostGIS                 Spatial queries and
                                                  geometries

  Authentication          Supabase Auth           Identity and sessions

  Authorization           Database-backed RBAC +  Permissions and
                          RLS                     jurisdiction scope

  Files                   Supabase Storage        Reports and approved
                                                  attachments

  Realtime                Supabase Realtime /     Status and operational
                          secure server events    updates

  Hosting                 Vercel                  Next.js application

  Source control          GitHub                  Code, issues and CI

  Email                   Resend or another       Transactional email
                          configured provider     

  Push                    Firebase Cloud          Browser notifications
                          Messaging or Web Push   

  SMS                     Approved Indian SMS     SMS delivery subject to
                          provider                applicable compliance
  -----------------------------------------------------------------------

Do not add infrastructure merely for architectural appearance. Start
with the simplest secure architecture that can be operated reliably. A
separate NestJS or FastAPI service should only be introduced when a
genuine workload or deployment requirement justifies it.

## 3.2 System boundaries

-   **GitHub:** source code, branches, pull requests, CI and version
    history.
-   **Vercel:** Next.js build, hosting, preview deployments and
    production deployment.
-   **Supabase:** PostgreSQL, Auth, Storage, RLS and Realtime.
-   **External providers:** authoritative alerts, weather, river
    observations, maps, routing, AI and notifications.
-   **Optional Python service:** ML inference, geospatial processing and
    heavy background jobs.

Vercel serverless functions are not a substitute for a durable
background worker. For scheduled polling, long-running geospatial jobs,
queues or retry-heavy processing, use a suitable managed
scheduler/worker/queue provider. Do not rely on in-memory timers in
serverless functions.

------------------------------------------------------------------------

# 4. Repository and folder structure

Use a clean structure similar to:

``` text
ne-resq/
├── apps/
│   └── web/
│       ├── app/
│       │   ├── (public)/
│       │   ├── (auth)/
│       │   ├── citizen/
│       │   ├── authority/
│       │   ├── district/
│       │   ├── state/
│       │   ├── control-room/
│       │   ├── rescue/
│       │   ├── shelter/
│       │   ├── volunteer/
│       │   ├── ngo/
│       │   └── api/
│       ├── components/
│       ├── features/
│       ├── hooks/
│       ├── lib/
│       ├── styles/
│       ├── public/
│       └── tests/
├── services/
│   └── ai-geospatial/          # Add only if needed
├── packages/
│   ├── shared-types/
│   ├── validation/
│   └── ui/
├── supabase/
│   ├── migrations/
│   ├── functions/              # Only for appropriate Edge Functions
│   └── config.toml
├── docs/
│   ├── ARCHITECTURE.md
│   ├── DATABASE.md
│   ├── DATA_SOURCES.md
│   ├── SECURITY.md
│   ├── DEPLOYMENT.md
│   ├── OPERATIONS.md
│   └── API.md
├── scripts/
├── .github/
│   └── workflows/
├── .env.example
├── .gitignore
├── README.md
└── package.json
```

Adapt this structure to the actual repository if it already has a sound
structure. Do not create unnecessary duplicate apps or services.

------------------------------------------------------------------------

# 5. Visual design specification --- Light iOS Liquid Glass with 3D

The visual identity must be premium, bright, polished and consistent
across all major pages.

## 5.1 Design direction

Use a light, glossy, Apple-inspired Liquid Glass visual language:

-   Pearl-white and soft-grey backgrounds.
-   Translucent frosted-glass panels.
-   Subtle backdrop blur.
-   Thin reflective borders.
-   Layered elevation and realistic soft shadows.
-   Restrained glossy highlights.
-   Premium coral-red and maroon emergency accents.
-   Deep charcoal text with high contrast.
-   Smooth micro-interactions.
-   Generous spacing and clear hierarchy.
-   Rounded but not excessively pill-shaped components.

Suggested palette:

  Token              Suggested value     Use
  ------------------ ------------------- --------------------------
  `background`       `#F7F8FA`           Main canvas
  `surface`          `#FFFFFF`           Solid panels
  `glass`            translucent white   Glass panels
  `text-primary`     `#20232A`           Main text
  `text-secondary`   `#727986`           Secondary text
  `emergency`        `#E94B55`           Emergency actions
  `maroon`           `#A82E42`           Brand accent
  `success`          accessible green    Confirmed/success states
  `warning`          accessible amber    Caution
  `critical`         accessible red      Critical warning

Avoid a dark-blue or purple-heavy theme, black-dominant pages, excessive
neon, excessive gradients and low-contrast glass text.

## 5.2 3D requirements

Use Three.js, React Three Fiber and Drei where they improve the
experience.

Every major page must have a purposeful 3D or depth treatment, but not
every small component needs a WebGL canvas.

Examples:

-   Home: interactive 3D Northeast terrain/map hero.
-   Disaster map: 3D terrain/elevation layer where suitable.
-   Citizen dashboard: layered depth cards and restrained 3D data
    visualization.
-   SOS: dimensional emergency control with clear accessible
    interaction.
-   Shelters: 3D map markers and floating facility panels.
-   Authority dashboard: depth-based operational panels.
-   Rescue portal: mission map and layered operation cards.
-   AI assistant: subtle animated assistant visualization.
-   Login/register: premium floating glass panel.
-   Analytics: dimensional charts only when they improve interpretation.
-   Resource portal: layered inventory cards and clear status
    indicators.

## 5.3 3D performance and accessibility

-   Lazy-load 3D scenes.
-   Dynamically import heavy components.
-   Use compressed and optimized assets.
-   Avoid unnecessary high-poly models.
-   Limit particle counts and expensive post-processing.
-   Provide a CSS/2D fallback if WebGL is unavailable.
-   Respect `prefers-reduced-motion`.
-   Provide keyboard access and semantic HTML.
-   Ensure emergency controls work without animation.
-   Do not let a 3D scene delay SOS or official alert content.
-   Test on low-end Android devices and slow connections.
-   Keep maps and emergency actions usable if WebGL fails.

The application must look premium without sacrificing performance or
clarity.

------------------------------------------------------------------------

# 6. Product portals and page map

Build these connected experiences using one shared backend and
permission model.

## 6.1 Public website

Pages:

-   Home
-   Live Disaster Map
-   Official Alerts
-   Weather and Flood Monitoring
-   Find Nearby Help
-   Verified Shelters
-   Hospitals and Emergency Facilities
-   Evacuation Guidance
-   Community Reports
-   AI Emergency Assistant
-   Disaster Preparedness
-   Emergency Contacts
-   About and Contact
-   Privacy Policy
-   Terms and Safety Disclaimer

Emergency safety information and public alerts must be accessible
without login.

## 6.2 Citizen portal

-   Profile and preferences
-   My SOS requests
-   Request status and history
-   My community reports
-   Saved facilities
-   Saved emergency contacts
-   Notification preferences
-   Language and accessibility settings
-   Privacy and account controls

## 6.3 Authority and control-room portal

-   Operational overview
-   Live incident map
-   Official alert management
-   SOS triage and verification
-   Rescue coordination
-   Rescue team status
-   Facility and shelter verification
-   Community report moderation
-   Resource inventory
-   Volunteer and NGO coordination
-   Missing-person case management
-   Analytics and reports
-   Data-provider health
-   Audit logs
-   User and role administration

## 6.4 Rescue team portal

-   Assigned operations
-   Assignment details
-   Accepted/rejected state
-   Operation status updates
-   Authorized incident location
-   Safe navigation information
-   Team communication
-   Resource requests
-   Completion report
-   Operation history

## 6.5 Shelter and facility portal

-   Facility profile
-   Verification details
-   Capacity and occupancy
-   Available services
-   Resource inventory
-   Shortage notifications
-   Incoming assistance requests
-   Update history

## 6.6 Volunteer and NGO portal

-   Registration
-   Organization verification
-   Skills and service area
-   Availability
-   Approved tasks
-   Assignment status
-   Resource contribution records
-   Activity history

------------------------------------------------------------------------

# 7. Functional modules

Implement the following modules as real workflows backed by the database
and server-side authorization.

## 7.1 Disaster intelligence and map

Support:

-   Flood and flash-flood information.
-   Rainfall and heavy-rain warnings.
-   River-level observations.
-   Landslide information.
-   Cyclone and storm alerts.
-   Earthquake information.
-   Verified road closures.
-   Verified affected areas.
-   Historical disaster records where sourced.

Map layers:

-   State and district boundaries.
-   Rivers and water bodies.
-   Terrain and elevation.
-   Official alert locations.
-   Verified hazard records.
-   Verified shelters and facilities.
-   Verified road closures.
-   Community reports with verification status.

Map filters:

-   State
-   District
-   Disaster type
-   Severity
-   Source
-   Verification status
-   Time range

Show data source, source timestamp, platform retrieval time and
freshness state.

Do not show a "live" label unless the data source and update cadence
justify it.

## 7.2 Official alert ingestion

Create provider adapters for authorized sources such as:

-   India Meteorological Department (IMD)
-   NDMA SACHET
-   Central Water Commission (CWC)
-   ISRO / NRSC
-   Forest Survey of India where relevant
-   State Disaster Management Authorities
-   Other approved sources

For each provider:

1.  Research its official documentation and actual access method.
2.  Confirm terms, permissions, credentials, rate limits and
    redistribution rights.
3.  Implement an isolated adapter.
4.  Validate incoming payloads against a typed schema.
5.  Normalize fields without changing the source meaning.
6.  Store original provider reference and permitted raw payload where
    appropriate.
7.  Store source timestamp and retrieval timestamp.
8.  Handle duplicates and updates idempotently.
9.  Expire alerts according to source validity.
10. Mark stale or unavailable data.
11. Log failures and retry safely.
12. Never fabricate a feed or API endpoint.

An official alert record should contain, where available:

-   Provider and provider reference
-   Original title and message
-   Disaster category
-   Source severity/classification
-   Affected geography
-   Issued time
-   Effective time
-   Expiry time
-   Original source URL/reference
-   Retrieval time
-   Verification status
-   Original language
-   Translation status

Keep official alerts separate from AI risk estimates and citizen
reports.

## 7.3 AI-assisted risk assessment

Build a configurable analysis pipeline using legitimate data only.

Potential input features:

-   Rainfall intensity and accumulation
-   River gauge observations
-   Forecast rainfall
-   Elevation and slope
-   Terrain and soil information
-   Historical flood records
-   Historical landslide records
-   Land cover and drainage information where available

Outputs may include:

-   Flood exposure estimates
-   Landslide susceptibility estimates
-   District-level risk summaries
-   Trend analysis
-   Model confidence and limitations

Risk labels may be Low, Moderate, High and Critical only when supported
by a documented methodology.

Requirements:

-   Do not invent training data.
-   Do not claim model accuracy without evaluation.
-   Record model version, inputs, time and output.
-   Show uncertainty and data freshness.
-   Do not turn an unvalidated model output into an official warning.
-   Require human review for consequential operational use.

## 7.4 SOS and emergency assistance

SOS must be one of the most reliable workflows.

Citizen submission:

-   Emergency category
-   Description
-   GPS location with permission
-   Manually selected location if GPS is unavailable
-   Number of people affected
-   Accessibility or medical assistance needs, if voluntarily supplied
-   Optional approved attachments
-   Contact method
-   Consent and privacy notice

Emergency categories:

-   Flood rescue
-   Landslide rescue
-   Medical emergency
-   Stranded person
-   Missing person
-   Food requirement
-   Drinking-water requirement
-   Shelter requirement
-   Other emergency

Workflow:

1.  Validate the request.
2.  Create a unique request identifier.
3.  Persist it transactionally.
4.  Return a confirmed server receipt.
5.  Notify the authorized control room.
6.  Show it in the authorized operations queue.
7.  Allow authorized triage and verification.
8.  Allow an authorized coordinator to assign a suitable team.
9.  Require the team to accept or reject.
10. Record status transitions.
11. Notify the citizen only after confirmed state changes.
12. Record resolution details and close the case.

Suggested statuses:

-   Submitted
-   Received by platform
-   Awaiting verification
-   Verified
-   Assigned
-   Accepted by team
-   In progress
-   Assistance provided
-   Closed
-   Cancelled
-   Unable to process

Do not imply that "Received by platform" means an emergency service or
rescue team has received the request.

Create an append-only status history with actor, timestamp and reason.

Protect sensitive location and contact information using strict access
control.

Do not implement real-world dispatch without authorized agency
agreements and operational procedures.

## 7.5 Evacuation guidance and routing

-   Use a real routing provider or self-hosted routing engine.
-   Use verified road closures and hazards.
-   Support walking and vehicle routes where the provider supports them.
-   Show route source and update time.
-   Do not route through known blocked or hazardous areas.
-   Do not claim a route is safe if current hazard coverage is
    incomplete.
-   Provide alternative official guidance when routing is unavailable.
-   Show that conditions may change rapidly.

## 7.6 Shelter and emergency facility locator

Facility categories:

-   Relief camps
-   Government shelters
-   Hospitals
-   Healthcare centres
-   Ambulance services
-   Fire stations
-   Police stations
-   Blood banks
-   Food distribution centres
-   Drinking-water facilities
-   Relief centres

Facility fields:

-   Name
-   Category
-   Address
-   Latitude and longitude
-   Contact details
-   Capacity, if verified
-   Current occupancy, if reported
-   Accessibility information
-   Available services
-   Operating status, if verified
-   Source
-   Verification status
-   Last updated time

Only show "available now" when there is a current, trustworthy
availability record. Otherwise show "availability not confirmed".

Allow authorized administrators to create, verify, update and deactivate
facility records.

## 7.7 Multilingual communication

Design the localization system to support:

-   English
-   Hindi
-   Assamese
-   Bengali
-   Bodo
-   Khasi
-   Garo
-   Manipuri/Meitei
-   Mizo
-   Nepali
-   Additional languages through configuration

Implement translation files and a maintainable localization framework.

Potential capabilities:

-   Localized interface
-   Emergency message translation
-   Text-to-speech
-   Speech-to-text
-   Voice-guided SOS
-   Accessible safety instructions

Preserve original official alert content. Clearly label machine
translations until verified. Do not let AI translation change severity,
location, time or safety meaning.

## 7.8 AI emergency assistant

Use retrieval-augmented generation over approved, verified safety
information.

The assistant should:

-   Answer disaster preparedness questions.
-   Explain official alerts.
-   Retrieve verified shelter information.
-   Explain how to submit SOS.
-   Provide approved safety checklists.
-   Support configured languages.
-   Cite the information source and date.
-   State when information is unavailable or stale.

The assistant must not invent phone numbers, official warnings, rescue
availability, medical advice or safe routes.

Do not let the assistant independently dispatch rescue services or alter
official alert records.

## 7.9 Community reporting

Allow users to submit:

-   Flooding
-   Landslide
-   Road blockage
-   Bridge damage
-   Infrastructure damage
-   Stranded residents
-   Missing-person information
-   Food/water shortage
-   Other incidents

Fields:

-   Category
-   Description
-   Location
-   Timestamp
-   Optional attachment
-   Submitter identity or permitted privacy mode
-   Review status

Statuses:

-   Unverified
-   Under review
-   Verified
-   Rejected
-   Resolved

AI may assist with categorization and duplicate detection, but a human
authority must verify consequential reports.

## 7.10 Relief resource management

Manage:

-   Food
-   Drinking water
-   Medicines
-   Clothing
-   Hygiene supplies
-   Emergency equipment
-   Other relief materials

Support:

-   Inventory receiving
-   Inventory adjustment
-   Distribution
-   Transfer between facilities
-   Shortage alerts
-   Resource requests
-   Transaction history
-   Authorized approval
-   Audit history

Never silently overwrite inventory. Record every transaction with actor,
quantity, time and reason.

## 7.11 Volunteer and NGO management

Volunteer profile:

-   Name
-   Contact information
-   Skills
-   Preferred service area
-   Availability
-   Training/certifications where relevant
-   Consent
-   Verification status

NGO profile:

-   Organization details
-   Authorized contact
-   Service area
-   Service categories
-   Verification documents
-   Available resources
-   Verification status

Keep personal details private. Only authorized coordinators should
access assignment-related information.

## 7.12 Missing-person and reunification

Implement a privacy-sensitive case workflow:

-   Missing-person report
-   Last known location
-   Time and date
-   Description
-   Authorized image upload
-   Reporter contact
-   Verification status
-   Found-person report
-   Potential match review
-   Family reunification case
-   Closure and audit history

Do not publicly expose personal images, contact details or exact
location by default. Require appropriate consent and authorized review
before public publication.

## 7.13 Offline PWA

Build an installable Progressive Web App with:

-   Cached emergency instructions
-   Cached emergency contact information from verified sources
-   User-selected downloadable district reference information
-   Cached maps only where provider licensing permits
-   Offline checklists
-   SOS draft storage
-   Safe synchronization after connectivity returns

Offline SOS must clearly say:

**"Pending synchronization --- not yet delivered."**

When online again:

-   Sync safely.
-   Use idempotency keys.
-   Prevent duplicate SOS creation.
-   Confirm server receipt.
-   Display the actual result.

Do not claim offline dispatch.

## 7.14 Notifications

Support configured channels:

-   In-app
-   Web push
-   Email
-   SMS

Implement:

-   User consent and preferences
-   Location-based subscriptions
-   Deduplication
-   Retry with backoff
-   Delivery logs
-   Provider error handling
-   Rate limiting
-   Emergency notification audit trail

Do not send SMS or email through fake provider implementations. If a
provider is not configured, show the channel as unavailable.

------------------------------------------------------------------------

# 8. Roles, permissions and authorization

Create a server-enforced role and jurisdiction model.

Roles:

1.  Super Administrator
2.  Central Authority
3.  State Administrator
4.  District Administrator
5.  Control Room Operator
6.  Rescue Coordinator
7.  Rescue Team Member
8.  Shelter Manager
9.  Healthcare Facility Manager
10. NGO Administrator
11. Volunteer
12. Registered Citizen
13. Public Visitor

Permissions must be enforced in server code and database policies, not
merely by hiding buttons.

Examples:

-   State administrators are scoped to assigned state(s).
-   District administrators are scoped to assigned district(s).
-   Rescue team members see only authorized assignments.
-   Shelter managers manage only their own facilities.
-   Volunteers see only approved assignments.
-   Citizens see only their own private requests.
-   Public visitors see only public, approved information.
-   Super administrators manage platform configuration.

Create an explicit permission matrix and test it.

Do not allow users to self-assign privileged roles through public
registration metadata.

Create a secure first-super-admin bootstrap process using a trusted
server-side procedure or controlled manual database operation. Never
hardcode a privileged account or password.

------------------------------------------------------------------------

# 9. Supabase database design

Use PostgreSQL with PostGIS. Create version-controlled SQL migrations.
Do not manually rely on undocumented dashboard changes.

## 9.1 Required logical tables

Create and normalize tables as appropriate:

### Identity and access

-   `profiles`
-   `roles`
-   `permissions`
-   `user_role_assignments`
-   `user_jurisdictions`
-   `audit_logs`

### Geography

-   `states`
-   `districts`
-   `administrative_boundaries`
-   `rivers`
-   `road_segments` where licensed and required
-   `risk_zone_geometries`

### Data providers and observations

-   `data_providers`
-   `provider_sync_runs`
-   `provider_health`
-   `weather_observations`
-   `rainfall_observations`
-   `river_gauges`
-   `river_observations`
-   `official_alerts`
-   `disaster_events`
-   `risk_assessments`

### Emergency operations

-   `sos_requests`
-   `sos_attachments`
-   `sos_status_history`
-   `rescue_teams`
-   `rescue_team_members`
-   `rescue_assignments`
-   `rescue_assignment_history`
-   `incident_communications`

### Facilities

-   `facilities`
-   `facility_contacts`
-   `facility_services`
-   `facility_capacity_observations`
-   `facility_verifications`
-   `road_closures`

### Community

-   `community_reports`
-   `community_report_attachments`
-   `community_report_reviews`

### Relief and participation

-   `resource_items`
-   `facility_inventory`
-   `inventory_transactions`
-   `resource_requests`
-   `volunteers`
-   `volunteer_assignments`
-   `organizations`
-   `organization_verifications`

### Missing-person cases

-   `missing_person_cases`
-   `reunification_cases`
-   `case_status_history`

### Notifications and AI

-   `notification_preferences`
-   `notifications`
-   `notification_deliveries`
-   `ai_conversations` only if retention is justified and disclosed
-   `ai_feedback`

### System

-   `system_settings`
-   `feature_flags`

Use UUIDs, foreign keys, check constraints, indexes, unique constraints
and timestamps where appropriate.

Do not create one giant table for unrelated data.

## 9.2 Data modelling rules

-   Use `timestamptz` and store timestamps in UTC.
-   Render local time appropriately in the UI.
-   Store coordinates using PostGIS geometry/geography with SRID 4326 as
    appropriate.
-   Add GiST spatial indexes for geographic search.
-   Use explicit status enums or constrained values.
-   Use idempotency keys for incoming provider events and SOS
    submissions.
-   Preserve provider IDs and source references.
-   Preserve original source content when legally and technically
    appropriate.
-   Separate raw provider ingestion from normalized application records.
-   Use soft deletion only where appropriate; retain audit records.
-   Define data retention and deletion rules for personal information.
-   Never store API secrets in ordinary application tables.
-   Avoid storing unnecessary sensitive information.

## 9.3 Row Level Security

Enable RLS on all user-accessible tables.

Create and test policies for:

-   Public read access to approved public information only.
-   Users reading their own profile and own private records.
-   District and state scoped administrators.
-   Rescue team assignment access.
-   Facility manager ownership.
-   Volunteer assignment access.
-   Super administrator access through a secure server-side path.

Do not use broad `USING (true)` or `WITH CHECK (true)` policies for
private tables.

Do not rely on the Supabase service-role key in the browser. It bypasses
RLS and must remain server-only.

Use least privilege for server-side operations. Validate user identity
and role on the server before privileged writes.

## 9.4 Storage buckets

Create buckets only as required, for example:

-   `community-report-attachments`
-   `sos-attachments`
-   `facility-verification-documents`
-   `organization-verification-documents`
-   `missing-person-restricted`
-   `public-approved-assets`

Most sensitive buckets should be private. Use signed URLs with short
expiry and authorization checks.

Validate file MIME type, extension, size and ownership. Consider malware
scanning before allowing files to be viewed or processed.

Do not make sensitive SOS or missing-person attachments publicly
accessible.

## 9.5 Initial database contents --- no demo data

Permitted initial content:

-   Official state reference records.
-   Official district reference records.
-   Legitimate administrative boundary datasets.
-   System roles and permission definitions.
-   Required platform configuration.
-   Data-provider definitions and integration status.
-   Verified public reference data only when sourced and licensed.

Do not seed:

-   Fake citizens
-   Fake administrators
-   Fake SOS requests
-   Fake rescue teams
-   Fake hospitals
-   Fake shelters
-   Fake weather
-   Fake river levels
-   Fake alerts
-   Fake community reports
-   Fake operational analytics

Create no operational records until genuine submissions or verified
imports exist.

------------------------------------------------------------------------

# 10. External data sources and data governance

Build a `DATA_SOURCES.md` document and a provider registry.

Investigate official source documentation and confirm access before
implementation.

Potential sources:

  -----------------------------------------------------------------------
  Source                  Potential information   Required validation
  ----------------------- ----------------------- -----------------------
  IMD                     Forecasts, rainfall and Current API/data
                          weather warnings        access, credentials,
                                                  terms

  NDMA SACHET             Official geo-targeted   Authorized feed/API
                          alerts                  access and
                                                  redistribution terms

  CWC                     River gauges and flood  Available station data
                          forecasts               and access method

  ISRO/NRSC/NDEM          Satellite and emergency Access eligibility,
                          geospatial information  licensing and
                                                  permissions

  Forest Survey of India  Landslide-related       Dataset availability
                          information where       and usage terms
                          available               

  State Disaster          State and district      Official publication
  Management Authorities  advisories              and integration
                                                  permission

  OpenStreetMap           Roads and map data      Attribution, tile
                                                  policy and applicable
                                                  licensing

  MapTiler or other map   Map tiles and geocoding API key, usage quota
  provider                                        and plan

  Routing provider        Route calculation       API key, coverage and
                                                  hazard integration
                                                  limits
  -----------------------------------------------------------------------

Do not assume that a public website provides a public API. Do not scrape
a provider if its terms do not allow it. Do not invent endpoints or
sample payloads.

For every provider, document:

-   Official documentation URL
-   Authentication method
-   Required credentials
-   Access approval status
-   Terms and licensing
-   Rate limits
-   Update cadence
-   Data fields
-   Geographic coverage
-   Failure behavior
-   Attribution requirements
-   Whether redistribution is allowed

## 10.1 Data freshness model

Implement consistent freshness states, for example:

-   Current
-   Delayed
-   Stale
-   Expired
-   Unavailable
-   Not configured

The threshold for each state must be provider-specific and documented.
Do not apply one arbitrary freshness threshold to all sources.

Show: - Source observation time - Platform retrieval time - Expected
update cadence where known - Current provider health

Never silently retain old data under a "live" label.

## 10.2 Provider adapter pattern

Create a common interface for providers, such as:

``` ts
interface DataProviderAdapter<T> {
  providerId: string;
  checkHealth(): Promise<ProviderHealth>;
  fetchUpdates(input?: FetchInput): Promise<ProviderResult<T>>;
  normalize(payload: unknown): NormalizedRecord[];
}
```

Use real provider-specific implementations only after confirming
documentation. The above is an architectural example, not a claim that
any provider exposes a particular API.

Provider ingestion must be idempotent, observable, validated and safe to
retry.

------------------------------------------------------------------------

# 11. Environment variables and secrets

Create `.env.example` with variable names and descriptions only. Do not
put actual credentials in it.

Use the exact environment variable names supported by the selected SDK
versions. Keep public and server-only values clearly separated.

Example configuration template:

``` dotenv
# Public application configuration
NEXT_PUBLIC_APP_URL=
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=

# Server-only Supabase credentials
SUPABASE_SECRET_KEY=
SUPABASE_DB_URL=

# Maps — use only the provider actually selected
NEXT_PUBLIC_MAPTILER_KEY=

# AI provider — server only
OPENAI_API_KEY=

# Email provider — server only
RESEND_API_KEY=
EMAIL_FROM_ADDRESS=

# SMS provider — server only
SMS_PROVIDER_API_KEY=
SMS_PROVIDER_API_SECRET=
SMS_SENDER_ID=

# Push notification configuration
FIREBASE_PROJECT_ID=
FIREBASE_CLIENT_EMAIL=
FIREBASE_PRIVATE_KEY=

# Official data providers — define only after confirming real access
IMD_API_BASE_URL=
IMD_API_KEY=
SACHET_FEED_URL=
SACHET_API_KEY=
CWC_API_BASE_URL=
CWC_API_KEY=
NRSC_API_BASE_URL=
NRSC_API_KEY=

# Background jobs / scheduled ingestion
CRON_SECRET=

# Observability
SENTRY_DSN=
```

Important:

-   Do not assume every provider requires an API key; configure only
    what its real access method requires.
-   Do not create fake values to make a build pass.
-   Validate required variables at server startup.
-   Fail safely with a clear configuration error.
-   Never expose server-only values to client bundles.
-   Never commit `.env`, `.env.local`, credentials or private keys.
-   Rotate any secret accidentally committed or exposed.
-   Keep separate credentials for development, preview/staging and
    production.
-   Use Vercel environment scopes correctly.

The current Supabase project may expose a publishable key such as
`sb_publishable_...`; use the actual key format shown by the project. Do
not assume an old `anon` key name if the selected SDK/project uses the
newer publishable-key model.

------------------------------------------------------------------------

# 12. GitHub workflow

Use GitHub as the source of truth.

## 12.1 Repository setup

-   Create a private repository during development.
-   Commit application source, migrations, tests and documentation.
-   Include `.gitignore`.
-   Include `.env.example`.
-   Exclude `.env`, `.env.local`, build output, dependency folders and
    secrets.
-   Use meaningful commit messages.
-   Protect the production branch where possible.
-   Use pull requests for significant changes.

## 12.2 Suggested branch strategy

-   `main`: production-ready code.
-   `develop`: integration branch if needed.
-   `feature/<name>`: feature work.
-   `fix/<name>`: bug fixes.

Do not commit unfinished experimental code directly to production.

## 12.3 GitHub Actions

Configure CI to run:

1.  Dependency installation using the lockfile.
2.  Formatting or format check.
3.  ESLint.
4.  TypeScript type-check.
5.  Unit tests.
6.  Integration tests where configured.
7.  Production build.
8.  Dependency/security checks where practical.

Do not put production secrets in repository files. Use GitHub Actions
secrets only when a workflow genuinely requires them.

------------------------------------------------------------------------

# 13. Vercel deployment

Deploy the Next.js application through Vercel connected to GitHub.

## 13.1 Deployment process

1.  Create the Vercel project.
2.  Import the correct GitHub repository.
3.  Confirm the framework is Next.js.
4.  Set the correct root directory if using a monorepo.
5.  Configure build and install commands if required.
6.  Add environment variables to the correct environments.
7.  Deploy a preview.
8.  Run smoke tests.
9.  Configure the production domain.
10. Enable HTTPS.
11. Promote a tested build to production.
12. Verify logs and health checks.

## 13.2 Environments

Maintain separate:

-   Local development
-   Preview/staging
-   Production

Do not point a public preview deployment at production data unless
intentionally authorized.

Use separate Supabase projects for staging and production when
practical.

## 13.3 Vercel considerations

-   Do not assume long-running background jobs will work inside a
    request handler.
-   Do not use in-memory timers for scheduled ingestion.
-   Protect cron endpoints with a secret.
-   Use queues or an external worker for long-running jobs.
-   Configure function duration and region based on actual workload and
    plan.
-   Monitor function errors and database connection usage.
-   Avoid opening excessive database connections.
-   Use connection pooling where appropriate.
-   Verify the production build locally and in CI.

------------------------------------------------------------------------

# 14. Maps, routing and geospatial requirements

Use MapLibre or another suitable map library.

Requirements:

-   Correct attribution.
-   Valid provider key where required.
-   Respect tile-provider usage terms.
-   Do not scrape or overload public tile servers.
-   Use licensed boundary and elevation datasets.
-   Store only the geographical data the application needs.
-   Use PostGIS for nearest-facility and spatial intersection queries.
-   Validate coordinates.
-   Handle missing GPS permission.
-   Allow manual location selection.
-   Never treat a map route as a guarantee of safety.

For evacuation routing, combine routing results with current verified
closures and hazard information where coverage exists. If hazard
coverage is incomplete, show an explicit warning and do not label a
route "safe".

------------------------------------------------------------------------

# 15. AI and machine-learning requirements

AI must be grounded in verified platform data and approved reference
documents.

## 15.1 AI assistant

-   Use retrieval-augmented generation.
-   Index only approved and maintained safety material.
-   Store document source, version and publication date.
-   Cite sources in answers.
-   Identify outdated documents.
-   Do not invent facts or emergency contacts.
-   Do not use private user records for public answers.
-   Apply rate limits and abuse prevention.
-   Disclose AI-generated content.
-   Do not claim the assistant is an emergency dispatcher.

## 15.2 Risk models

-   Do not train on fabricated records.
-   Do not claim a model exists before it is implemented.
-   Do not claim predictive accuracy without a held-out evaluation.
-   Track model version and dataset provenance.
-   Record input freshness.
-   Include uncertainty and known limitations.
-   Require human review before consequential use.
-   Keep model estimates separate from official warnings.

## 15.3 Image analysis

-   Use only appropriate, lawful model/provider integrations.
-   Treat image classification as decision support.
-   Do not automatically verify an incident from an image.
-   Keep human review in the workflow.
-   Validate uploads and protect personal images.

------------------------------------------------------------------------

# 16. Security, privacy and compliance

Treat the application as a sensitive system.

Implement:

-   Secure authentication and session handling.
-   Email verification.
-   Password reset.
-   MFA for privileged users where supported.
-   Server-side authorization.
-   RLS on private database tables.
-   Input validation and output encoding.
-   Rate limiting.
-   CSRF protections where applicable.
-   XSS prevention.
-   SQL injection prevention through parameterized queries/ORM.
-   Secure file validation.
-   Private storage for sensitive attachments.
-   Short-lived signed URLs.
-   Audit trails.
-   Data retention policies.
-   Account deletion and privacy workflows.
-   Consent for location and notifications.
-   Encryption in transit and appropriate encryption at rest.
-   Backup and restore procedures.
-   Security logging and alerting.

Collect the minimum personal data necessary.

Do not publicly display: - Private phone numbers - Exact private home
locations - Medical details - SOS attachments - Missing-person sensitive
details - Volunteer personal details - Private rescue communications

Provide clear privacy, terms, consent and safety disclaimers. Obtain
appropriate legal and operational review before public emergency use.

------------------------------------------------------------------------

# 17. Reliability, accessibility and performance

The application must work on:

-   Low-end Android devices
-   Modern desktop browsers
-   Tablets
-   Slow mobile networks
-   Intermittent connectivity

Implement:

-   Responsive layouts
-   Lazy loading
-   Image optimization
-   Code splitting
-   API timeouts
-   Retry with backoff
-   Idempotent writes
-   Error boundaries
-   Realtime reconnection
-   Graceful provider failure
-   Data caching with clear invalidation
-   Database indexes
-   Query pagination
-   Rate limiting
-   Observability hooks
-   PWA support
-   Keyboard navigation
-   Semantic markup
-   Accessible contrast
-   Reduced-motion support

Emergency pages should prioritize text, critical controls and verified
information before loading heavy map or 3D content.

------------------------------------------------------------------------

# 18. Testing and acceptance criteria

Create real automated tests and perform manual browser checks.

## 18.1 Required tests

-   Unit tests
-   API tests
-   Database and migration tests
-   Authentication tests
-   Role and jurisdiction permission tests
-   RLS policy tests
-   SOS end-to-end tests
-   Rescue assignment tests
-   Status history tests
-   File upload tests
-   Notification tests
-   Provider adapter tests
-   Offline synchronization tests
-   Map interaction tests
-   Responsive layout tests
-   Accessibility checks
-   Security checks

## 18.2 Failure scenarios

Test:

-   Supabase unavailable
-   Provider API unavailable
-   Expired API credentials
-   Invalid provider payload
-   Stale data
-   Duplicate provider event
-   Duplicate SOS submission
-   GPS permission denied
-   Invalid coordinates
-   Internet lost during submission
-   Offline request synchronization
-   Notification delivery failure
-   Unauthorized role access
-   Invalid or oversized file
-   Expired official alert
-   Rescue assignment conflict
-   WebGL unavailable
-   Reduced-motion preference enabled

## 18.3 Acceptance criteria

A module is complete only when:

-   Its UI exists.
-   Its backend operation exists.
-   Its database persistence works.
-   Its permissions are enforced.
-   Its validation works.
-   Its loading, empty and error states exist.
-   Its tests pass.
-   Its user-visible status is truthful.
-   Its documentation is updated.

Do not mark an integration "connected" until a real authenticated
request or approved data flow has been tested successfully.

------------------------------------------------------------------------

# 19. Phased implementation plan

Build all requested capabilities, but deliver them in safe, testable
phases.

## Phase 0 --- Repository and architecture

-   Inspect project.
-   Confirm architecture.
-   Establish code standards.
-   Configure Git and CI.
-   Create documentation skeleton.
-   Define database entities and permissions.

## Phase 1 --- Foundation

-   Next.js application.
-   Shared design system.
-   Liquid Glass components.
-   3D component foundation.
-   Supabase client/server setup.
-   Auth.
-   Profiles and roles.
-   RLS.
-   Migrations.
-   First admin bootstrap process.

## Phase 2 --- Public and citizen portal

-   Public pages.
-   State/district selection.
-   Emergency information.
-   Citizen profile.
-   SOS submission and tracking.
-   Community reports.
-   Notification preferences.

## Phase 3 --- GIS and real data ingestion

-   MapLibre.
-   Geographic reference data.
-   PostGIS queries.
-   Provider registry.
-   Official alert adapters.
-   Weather and river adapters where authorized.
-   Provider health and freshness.
-   Data provenance.

## Phase 4 --- Operations portals

-   Control-room dashboard.
-   SOS verification.
-   Rescue assignment.
-   Rescue team portal.
-   Shelter portal.
-   Facility verification.
-   Status history and notifications.

## Phase 5 --- Relief and community operations

-   Inventory.
-   Resource requests.
-   Volunteer portal.
-   NGO portal.
-   Missing-person workflow.
-   Reunification controls.

## Phase 6 --- Advanced intelligence

-   AI assistant with verified retrieval.
-   Multilingual support.
-   Speech support where configured.
-   Risk assessment pipeline.
-   Image-assisted report review.
-   Analytics and exports.

## Phase 7 --- Offline and advanced GIS

-   PWA.
-   Offline guidance.
-   Safe SOS draft synchronization.
-   Evacuation routing.
-   Terrain visualization.
-   Satellite/drone/IoT integration interfaces where authorized.

## Phase 8 --- Hardening and release

-   Security review.
-   Performance review.
-   Accessibility review.
-   Full end-to-end testing.
-   Backup/restore test.
-   Deployment verification.
-   Operations documentation.
-   Production readiness report.

Do not omit later phases. If external data access is pending, complete
the integration adapter, configuration documentation and truthful
unavailable state without inventing data.

------------------------------------------------------------------------

# 20. Required documentation deliverables

Create and maintain:

## `README.md`

-   Project summary
-   Features
-   Technology stack
-   Prerequisites
-   Local setup
-   Development commands
-   Testing commands
-   Build commands
-   Deployment overview

## `docs/ARCHITECTURE.md`

-   System architecture
-   Component boundaries
-   Data flow
-   Trust boundaries
-   Authentication and authorization design
-   Background processing approach

## `docs/DATABASE.md`

-   ERD or relationship overview
-   Tables and columns
-   Indexes
-   RLS policy summary
-   Migration procedure
-   Backup and restore

## `docs/DATA_SOURCES.md`

-   Official source links
-   Actual access methods
-   Credentials required
-   Approval status
-   Licensing
-   Update cadence
-   Data mapping
-   Failure behavior

## `docs/DEPLOYMENT.md`

-   GitHub setup
-   Supabase project setup
-   Environment variables
-   Vercel setup
-   Preview deployment
-   Production deployment
-   Domain and HTTPS
-   Rollback

## `docs/SECURITY.md`

-   Secrets management
-   RLS
-   RBAC
-   Storage policies
-   Personal data
-   Audit logs
-   Incident response

## `docs/OPERATIONS.md`

-   Provider health
-   Failed ingestion handling
-   Backup schedule
-   Monitoring
-   Recovery
-   Admin bootstrap
-   Release checklist

## `docs/API.md`

-   API routes
-   Request/response schemas
-   Authentication
-   Error codes
-   Rate limits
-   Idempotency rules

------------------------------------------------------------------------

# 21. Final handover checklist

Before declaring completion, verify all applicable items:

### Code and deployment

-   [ ] Repository is clean and GitHub-ready.
-   [ ] No secret is committed.
-   [ ] `.env.example` is complete.
-   [ ] Vercel build succeeds.
-   [ ] Preview deployment works.
-   [ ] Production configuration is documented.
-   [ ] Rollback instructions exist.

### Database

-   [ ] Supabase schema is version-controlled.
-   [ ] Migrations run successfully.
-   [ ] PostGIS is configured.
-   [ ] RLS is enabled and tested.
-   [ ] Storage policies are tested.
-   [ ] No demo operational records exist.
-   [ ] Backup and restore instructions exist.

### Product

-   [ ] All public pages work.
-   [ ] Citizen registration/login works.
-   [ ] Role permissions work.
-   [ ] SOS persists correctly.
-   [ ] Rescue assignment workflow works.
-   [ ] Facility search works on verified records.
-   [ ] Community reports work.
-   [ ] Resource management works.
-   [ ] Notifications work when configured.
-   [ ] Offline state is truthful.
-   [ ] AI answers cite approved sources.
-   [ ] All buttons and links have real behavior.

### Data

-   [ ] Provider integrations use documented access methods.
-   [ ] Source provenance is recorded.
-   [ ] Data freshness is visible.
-   [ ] Stale and expired records are handled.
-   [ ] No fabricated live data is displayed.
-   [ ] Unconfigured services are clearly marked.

### Design and performance

-   [ ] Light Liquid Glass design is consistent.
-   [ ] Every major page has meaningful depth/3D treatment.
-   [ ] 3D has a non-WebGL fallback.
-   [ ] Reduced motion works.
-   [ ] Mobile layout works.
-   [ ] Emergency content loads before decorative effects.
-   [ ] Accessibility checks are performed.

### Safety

-   [ ] Private SOS data is protected.
-   [ ] Missing-person records are restricted.
-   [ ] Rescue status claims are accurate.
-   [ ] Official alerts are distinct from AI estimates.
-   [ ] Emergency disclaimers are visible.
-   [ ] No unauthorized real-world dispatch is claimed.

------------------------------------------------------------------------

# 22. Final instruction to Antigravity

Build NE-RESQ as a complete, coherent and maintainable application---not
a collection of disconnected screens.

The final product should combine:

-   A premium light iOS Liquid Glass visual identity.
-   Purposeful 3D interactions across all major pages.
-   A real Supabase-backed data model.
-   Secure authentication and role-based permissions.
-   A functional SOS and rescue coordination workflow.
-   Real, authorized disaster data integrations.
-   GIS and geographical intelligence.
-   AI assistance grounded in verified information.
-   Relief, shelter, volunteer and NGO management.
-   Offline emergency guidance.
-   Production-oriented GitHub and Vercel deployment.

The website must look exceptional, but its most important qualities are
truthfulness, reliability, speed, safety and operational clarity.

**Never fabricate a real-world emergency capability to make the product
look complete.**

If credentials, provider access, official datasets or agency approvals
are missing, identify the exact dependency, complete all possible
engineering work, and expose a clear configuration status.

Deliver the source code, database migrations, tests, documentation and
deployment instructions.

**NE-RESQ --- Technology for Preparedness. Intelligence for Safety.
Innovation for Saving Lives.**
