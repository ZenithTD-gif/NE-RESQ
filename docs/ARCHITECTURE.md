# NE-RESQ Architecture Specification

## 1. System Topology

NE-RESQ is designed around a decoupled, resilient architecture connecting citizens, district control rooms, field rescue teams, and relief managers across all eight Northeast Indian states.

```mermaid
graph TD
    subgraph Citizens_Public
        Client[Public Web & PWA]
        OfflineQueue[Offline LocalStorage Queue]
    end

    subgraph Application_Layer [Next.js App Router on Vercel]
        PublicPages[Public Portals & 3D Radar]
        REST_API[Typed Next.js Server Routes]
        AuthGuard[Server-Side RBAC Enforcement]
    end

    subgraph Data_Layer [Managed PostgreSQL + PostGIS]
        RelationalDB[(36 Logical Relational Tables)]
        SpatialIndex[(PostGIS Spatial SRID 4326)]
        AuditLog[(Append-Only Audit Ledger)]
    end

    subgraph Agency_Terminals
        ControlRoom[Control Room Dispatcher]
        RescueTerminal[NDRF / SDRF Field Units]
        ShelterTerminal[Relief Camp Managers]
        DistrictAdmin[DDMA Administrators]
    end

    subgraph External_Feeds [Authoritative Feeds - Zero Mock]
        IMD[IMD Weather]
        CWC[CWC River Hydrographs]
        NDMA[NDMA SACHET CAP Feed]
        ISRO[ISRO NRSC Satellite DMS]
    end

    Client -->|HTTPS / REST| REST_API
    OfflineQueue -.->|Atomic Sync on Reconnect| REST_API
    REST_API --> AuthGuard
    AuthGuard --> RelationalDB
    AuthGuard --> SpatialIndex
    AuthGuard --> AuditLog

    ControlRoom -->|Manage & Triage| REST_API
    RescueTerminal -->|Accept & Update Status| REST_API
    ShelterTerminal -->|Log Headcount & Supplies| REST_API
    DistrictAdmin -->|Broadcast Alerts| REST_API

    External_Feeds -.->|Validated Adapters| REST_API
```

## 2. Trust Boundaries & Roles

1. **Public Zone**: Public pages, disaster preparedness guides, official alerts, verified shelters, and emergency SOS submission without requiring registration.
2. **Citizen Zone**: Authenticated citizens viewing personal SOS tracking and past submissions.
3. **Operational Zone**: Control room dispatchers triaging requests, assigning rescue units, and logging status history.
4. **Field Tactical Zone**: NDRF/SDRF units accepting missions, updating status, and reporting completions.
5. **Administrative Zone**: State and District disaster managers managing facility verification, broadcasting official warnings, and reviewing crowd reports.
