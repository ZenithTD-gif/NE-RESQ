# Security, Privacy & Authorization Specification

## 1. Role-Based Access Control (RBAC)

The platform supports 13 hierarchical operational roles:
1. `SUPER_ADMIN`: System configuration, provider credentials, platform management
2. `NATIONAL_AUTHORITY`: Multi-state emergency coordination
3. `STATE_ADMIN`: State-scoped alert approval and facility management
4. `DISTRICT_ADMIN`: District-scoped warnings and report moderation
5. `CONTROL_ROOM_OPERATOR`: Emergency SOS triage and rescue dispatching
6. `RESCUE_COORDINATOR`: Field battalion assignment
7. `RESCUE_TEAM_MEMBER`: Mission updates and field communications
8. `SHELTER_MANAGER`: Headcount updates and camp inventory
9. `HEALTHCARE_ADMIN`: Hospital bed availability and ambulance tracking
10. `NGO_ADMIN`: Relief material distribution
11. `VOLUNTEER`: Field task participation
12. `REGISTERED_CITIZEN`: Private SOS tracking and incident history
13. `PUBLIC_VISITOR`: Public advisories and safe shelter locator

## 2. Privacy & Citizen Safeguards

- **No Public Citizen Identity**: Personal names, phone numbers, exact residential coordinates, and medical conditions submitted via SOS are accessible **only to authorized control room dispatchers and assigned rescue team commanders**.
- **Short-Lived Signed URLs**: Attachments in storage buckets utilize short-lived signed URLs with authorization validation.
- **Append-Only Auditing**: Every status transition (e.g. `ASSIGNED`, `RESCUE_IN_PROGRESS`) is logged with an immutable audit entry recording actor ID, timestamp, and action remarks.
