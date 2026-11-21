# NE-RESQ Database Schema Dictionary

### 1. `states`
* **`id`** (`UUID`, PK): Unique state identifier.
* **`code`** (`VARCHAR(10)`, UNIQUE): Two-letter official ISO code (`AS`, `AR`, `ML`, `MN`, `MZ`, `NL`, `TR`, `SK`).
* **`name`** (`VARCHAR(100)`): State name.
* **`capital`** (`VARCHAR(100)`): State capital.
* **`eoc_helpline`** (`VARCHAR(50)`): Primary SEOC toll-free line (default `1070`).
* **`sdma_website`** (`VARCHAR(255)`): Official SDMA portal URL.
* **`latitude`, `longitude`** (`DOUBLE PRECISION`): Central geographical coordinates.
* **`is_active`** (`BOOLEAN`): Administrative toggle.

### 2. `districts`
* **`id`** (`UUID`, PK): Unique district identifier.
* **`state_id`** (`UUID`, FK -> `states.id`): Enclosing state.
* **`code`** (`VARCHAR(20)`): State-district code (e.g. `AS-KM`).
* **`name`** (`VARCHAR(100)`): District name.
* **`headquarters`** (`VARCHAR(100)`): District administrative town.
* **`deoc_helpline`** (`VARCHAR(50)`): Direct DEOC helpline (default `1077`).
* **`vulnerability_level`** (`VARCHAR(20)`): Risk index (`LOW`, `MODERATE`, `HIGH`, `CRITICAL`).

### 3. `admin_roles` & `admin_users`
* **`admin_roles`**: System roles (`SUPER_ADMIN`, `STATE_ADMIN`, `DISTRICT_ADMIN`, `CONTACT_MANAGER`, `ALERT_MANAGER`, `CONTENT_MANAGER`, `READONLY_ADMIN`).
* **`admin_users`**:
  * `email`, `password_hash`, `full_name`, `phone`, `role_id`, `department`, `designation`.
  * `state_id`, `district_id`: Scoped jurisdiction for State/District admins.
  * `status`: Approval lifecycle (`PENDING_APPROVAL`, `APPROVED`, `REJECTED`, `SUSPENDED`).
  * `approved_by` (FK -> `admin_users.id`), `approved_at`.

### 4. `emergency_contacts`
* **`id`** (`UUID`, PK).
* **`contact_name`**, **`department_name`**, **`organization`**.
* **`category`**: Enum (`NATIONAL_EMERGENCY`, `DISASTER_MANAGEMENT`, `STATE_EOC`, `DISTRICT_EOC`, `NDRF`, `SDRF`, `POLICE`, `FIRE_RESCUE`, `AMBULANCE_MEDICAL`, `HEALTH_TELEMEDICINE`, `WOMEN_CHILD_SAFETY`, `HOSPITAL_CASUALTY`, `RELIEF_CAMP`, `OTHER_EMERGENCY`).
* **`scope`**: `NATIONAL`, `STATE`, `DISTRICT`.
* **`state_id`**, **`district_id`**.
* **`contact_number`**, **`alternate_number`**, **`is_toll_free`**.
* **`email`**, **`official_website`**, **`office_address`**, **`operating_hours`**.
* **`source_url`**: Compulsory official government proof/URL.
* **`verification_status`**: `UNVERIFIED`, `PENDING_REVIEW`, `VERIFIED_OFFICIAL`, `REJECTED`.
* **`publication_status`**: `DRAFT`, `PUBLISHED`, `ARCHIVED`.

### 5. `official_alerts`
* **`id`** (`UUID`, PK), **`alert_code`** (`VARCHAR(50)`, UNIQUE).
* **`title`**, **`category`** (`FLOOD`, `LANDSLIDE`, `EARTHQUAKE`, `CYCLONE`, `HEAVY_RAINFALL`, `THUNDERSTORM_LIGHTNING`, etc.).
* **`severity`**: `ADVISORY`, `WATCH`, `WARNING`, `SEVERE_WARNING`, `EMERGENCY`.
* **`urgency`**, **`certainty`**, **`description`**, **`safety_instructions`**.
* **`affected_states`** (`JSONB`), **`affected_districts`** (`JSONB`).
* **`issued_by_agency`**, **`issued_at`**, **`expires_at`**.
* **`publication_status`**, **`is_active`**.

### 6. `healthcare_facilities`, `shelters`, `rescue_facilities`
* Normalized tables representing hospital casualty wards, designated flood/earthquake shelters with live occupancies, and operational NDRF/SDRF tactical response stations.

### 7. `website_content` & `admin_audit_logs`
* Public announcements, preparedness manuals, and immutable SHA-logged administrative actions.
