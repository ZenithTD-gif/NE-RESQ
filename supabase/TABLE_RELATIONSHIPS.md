# NE-RESQ Entity Relationships & Foreign Key Hierarchy

```
                    ┌─────────────────────────┐
                    │         states          │
                    └────────────┬────────────┘
                                 │ 1:N
                    ┌────────────▼────────────┐
                    │        districts        │
                    └────────────┬────────────┘
                                 │
     ┌───────────────────────────┼───────────────────────────┐
     │ 1:N                       │ 1:N                       │ 1:N
┌────▼─────────────────┐   ┌─────▼───────────────┐   ┌───────▼─────────────────┐
│ emergency_contacts   │   │ healthcare_facilities│   │         shelters        │
└──────────────────────┘   └─────────────────────┘   └─────────────────────────┘
     ▲                           ▲                           ▲
     │ verified_by               │ verified_by               │ verified_by
┌────┴───────────────────────────┴───────────────────────────┴─────────────────┐
│                               admin_users                                    │
└─────────────────────────────────────┬────────────────────────────────────────┘
                                      │ N:1
                             ┌────────▼────────┐
                             │   admin_roles   │
                             └─────────────────┘
```

### Relational Integrity Rules
1. **Cascade vs Restrict:** Deleting a state cascades to its enclosed districts. However, states and districts referenced by verified shelters and emergency contacts are protected with `ON DELETE RESTRICT` or `ON DELETE SET NULL` to preserve historical public records.
2. **Audit Reference:** All administrative updates link `admin_id` to `admin_audit_logs` with `ON DELETE SET NULL` to ensure historical logs survive personnel deactivations.
3. **Multi-Jurisdiction Alert Mapping:** Alerts store `affected_states` and `affected_districts` as structured JSONB arrays to support multi-state warnings (e.g. Brahmaputra basin heavy rainfall spanning Assam and Arunachal Pradesh).
