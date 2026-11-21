# REST API Specification

All API endpoints return standard JSON responses with HTTP status codes and strict schema validation.

## 1. Endpoints Overview

| Method | Endpoint | Description | Auth Scopes |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/sos` | List SOS requests (filterable by state, district, status) | Control Room, Admin |
| `POST` | `/api/sos` | Submit an emergency SOS dispatch request | Public (No auth required) |
| `GET` | `/api/sos/[id]` | Get detailed status and timeline history by ID or tracking ID | Public (with tracking ID) |
| `PATCH` | `/api/sos/[id]` | Update operational status or assign rescue unit | Control Room, Rescue Team |
| `GET` | `/api/alerts` | List official alerts (filterable by state, district, severity) | Public |
| `POST` | `/api/alerts` | Broadcast an official district or state warning | District/State Admin |
| `GET` | `/api/shelters` | Query verified relief camps and shelters | Public |
| `POST` | `/api/shelters` | Register a verified emergency shelter | Shelter Manager, Admin |
| `GET` | `/api/reports` | List moderated community disaster reports | Public |
| `POST` | `/api/reports` | Submit a crowdsourced ground incident report | Public |
| `GET` | `/api/providers/status` | Ingestion health and external provider connectivity status | Public |
| `GET` | `/api/rescue/teams` | List operational NDRF / SDRF units | Control Room |
| `POST` | `/api/assistant` | Query grounded NDMA disaster safety RAG | Public |

## 2. Example: POST /api/sos

```json
{
  "citizenName": "Bipul Sarma",
  "contactPhone": "+91 9876543210",
  "category": "FLOOD_RESCUE",
  "state": "Assam",
  "district": "Kamrup Metropolitan",
  "locationAddress": "House 14, Near Bharalu Bridge, Kumarpara",
  "latitude": 26.1754,
  "longitude": 91.7321,
  "affectedCount": 3,
  "hasMedicalEmergency": true,
  "medicalDetails": "Elderly citizen requires insulin and dry high ground",
  "hasAccessibilityNeeds": false
}
```

Response (`201 Created`):
```json
{
  "success": true,
  "message": "Emergency request registered. Stand by for response verification.",
  "data": {
    "id": "sos_1732174200000_A1B2C",
    "trackingId": "NER-2026-X9K2L",
    "status": "SUBMITTED",
    "priorityLevel": "CRITICAL_LIFE_THREATENING",
    "statusHistory": [
      {
        "status": "SUBMITTED",
        "timestamp": "2026-11-21T10:30:00.000Z",
        "remarks": "Emergency request registered on NE-RESQ regional dispatch network."
      }
    ]
  }
}
```
