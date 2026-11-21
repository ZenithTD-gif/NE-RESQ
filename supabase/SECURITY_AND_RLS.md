# NE-RESQ Security Architecture & Row Level Security (RLS)

### Security Principles
1. **Public Zero-Trust Policy:** Anonymous public traffic on the User Website has **read-only** visibility, and can **only** query records where `publication_status = 'PUBLISHED'` and `verification_status = 'VERIFIED_OFFICIAL'`.
2. **Draft & Unverified Quarantine:** Newly created or pending emergency contacts and alerts cannot be read by public visitors until an authorized administrator verifies the official government source URL and switches publication to `PUBLISHED`.
3. **No Automatic Super Admin:** Public signup can *never* yield administrative privileges. All registrations enter `status = 'PENDING_APPROVAL'` and require cryptographic approval by an active `SUPER_ADMIN`.
4. **Server-Side Enforcement:** Frontend role checks are merely for user interface ergonomics. Real permission enforcement occurs at the database RLS layer and the server-side API boundary.

---

### Role Privilege Matrix

| Role Code | Can Approve Admins | Manage Emergency Contacts | Publish Disaster Alerts | Manage Shelters & Hospitals | Content & Guidelines | View Audit Logs |
| :--- | :---: | :---: | :---: | :---: | :---: | :---: |
| **`SUPER_ADMIN`** | ✅ | ✅ (All 8 States) | ✅ (All 8 States) | ✅ | ✅ | ✅ |
| **`STATE_ADMIN`** | ❌ | ✅ (Own State) | ✅ (Own State) | ✅ (Own State) | ✅ | ✅ (Own State) |
| **`DISTRICT_ADMIN`**| ❌ | ✅ (Own District)| ✅ (Own District)| ✅ (Own District)| ❌ | ✅ (Own District)|
| **`CONTACT_MANAGER`**| ❌ | ✅ (All 8 States)| ❌ | ❌ | ❌ | ❌ |
| **`ALERT_MANAGER`** | ❌ | ❌ | ✅ (All 8 States) | ❌ | ❌ | ❌ |
| **`CONTENT_MANAGER`**| ❌ | ❌ | ❌ | ❌ | ✅ | ❌ |
| **`READONLY_ADMIN`** | ❌ | 👁️ (View Only) | 👁️ (View Only) | 👁️ (View Only) | 👁️ (View Only) | 👁️ (View Only) |
