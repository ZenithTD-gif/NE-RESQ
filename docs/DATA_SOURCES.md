# External Data Sources & Governance Specification

NE-RESQ enforces a strict **zero-mock policy**: external data feeds must either originate from legitimate, authorized integrations or be explicitly presented with a configuration requirement status.

## 1. Provider Registry

| Provider | Agency | Ingestion Protocol | Authentication | Status Without Credentials |
| :--- | :--- | :--- | :--- | :--- |
| **IMD Weather** | India Meteorological Department | REST API / Regional AWS | API Key (RMC Guwahati) | `"Service not connected — configuration required."` |
| **CWC Flood Forecast** | Central Water Commission | GeoJSON / FFS REST API | API Token | `"Service not connected — configuration required."` |
| **NDMA SACHET** | National Disaster Management Authority | Common Alerting Protocol (CAP) / Atom | OAuth2 / CAP Token | `"Service not connected — configuration required."` |
| **ISRO / NRSC Bhuvan** | National Remote Sensing Centre | WMS / WFS Geo-services | Enterprise GIS Token | `"Service not connected — configuration required."` |

## 2. Ingestion Principles

1. **Idempotency**: All incoming external feeds are ingested using unique external identifiers to prevent duplicate alerts.
2. **Freshness Window**: Every observation carries both `observed_at` and `ingested_at` timestamps. Records exceeding their valid period are marked `EXPIRED` automatically.
3. **Attribution**: The issuing agency must be clearly displayed on every citizen-facing notification.
