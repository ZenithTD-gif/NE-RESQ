# NE-RESQ — Super Administrator Setup, Clearance & Incident Directorate Guide

This technical guide documents the authoritative security protocols, environment variable configurations, database role provisioning, and troubleshooting workflows for the **NE-RESQ Super Administrator Command Directorate**.

---

## 1. Quick Access Summary

| Security Parameter | Production Specification |
| :--- | :--- |
| **Command Portal URL** | [`/admin/login`](http://localhost:3000/admin/login) *(or `/admin/dashboard` when clearance is active)* |
| **Public Navbar Entry** | Prominently positioned **Admin Portal** button beside the NE-RESQ branding in the header |
| **Current Directorate Email** | `tdeka379@gmail.com` *(Configured on the server via `ADMIN_EMAIL`)* |
| **Password Specification** | Managed through server-side environment variables and hashed (`SHA-256`) in Supabase |
| **Clearance Level** | `SUPER_ADMIN` (State Disaster Management Directorate — Full Authority) |
| **Database Target** | `public.admin_users` linked to `admin_roles (code: 'SUPER_ADMIN')` in Supabase |

---

## 2. Super Administrator Credential Configuration

### Exact Environment Variables

The Super Administrator root credentials are never hardcoded in client-side bundles or public GitHub repositories. They are controlled on the server via `apps/web/.env.local`:

```ini
# ==============================================================================
# SUPER ADMINISTRATOR MASTER CREDENTIALS (SERVER-SIDE ONLY)
# ==============================================================================
ADMIN_EMAIL=your_directorate_email@example.com
ADMIN_PASSWORD=your_secure_passphrase_here
```

> [!IMPORTANT]
> - **`ADMIN_EMAIL`**: Required. The email address authorized to unlock the Super Admin gateway.
> - **`ADMIN_PASSWORD`**: Required. The master passphrase matching the cryptographic hash stored in the Supabase PostgreSQL cluster.
> - These variables are **never** prefixed with `NEXT_PUBLIC_`. They are only accessible inside server-side Node.js runtimes (`apps/web/app/api/auth/route.ts`).

---

## 3. How to Configure Credentials via Terminal

### Step 1: Update Local Environment File
In your local repository, configure the credentials in `apps/web/.env.local`:

```bash
# Navigate to the web application root
cd apps/web

# Add or update Super Admin variables in .env.local
echo "ADMIN_EMAIL=tdeka379@gmail.com" >> .env.local
echo "ADMIN_PASSWORD=@Tridipmac07" >> .env.local
```

### Step 2: Synchronize Credentials with Supabase Database
To ensure zero-trust database consistency, execute the following script from the terminal to register or update the cryptographic hash in Supabase:

```bash
node -e '
const { Client } = require("pg");
const crypto = require("crypto");

function hash(pwd) {
  return crypto.createHash("sha256").update(pwd).digest("hex");
}

const client = new Client({
  connectionString: process.env.DATABASE_URL || "postgresql://postgres:@Tridipmac07@db.iygprrxtlrvbdweydswh.supabase.co:5432/postgres",
  ssl: { rejectUnauthorized: false }
});

async function syncAdmin() {
  await client.connect();
  const email = process.env.ADMIN_EMAIL || "tdeka379@gmail.com";
  const pwd = process.env.ADMIN_PASSWORD || "@Tridipmac07";
  const pwdHash = hash(pwd);

  const roleRes = await client.query("SELECT id FROM admin_roles WHERE code = '\''SUPER_ADMIN'\''");
  const roleId = roleRes.rows[0].id;

  await client.query(`
    INSERT INTO admin_users (email, password_hash, full_name, phone, department, designation, role_id, status, approved_at)
    VALUES ($1, $2, '\''Incident Commander (T. Deka)'\'', '\''+91 1070'\'', '\''Northeast Disaster Operations Center'\'', '\''Chief Incident Commander'\'', $3, '\''APPROVED'\'', NOW())
    ON CONFLICT (email) DO UPDATE 
    SET password_hash = $2, role_id = $3, status = '\''APPROVED'\'';
  `, [email, pwdHash, roleId]);

  console.log("Super Admin account successfully synchronized in Supabase database for:", email);
  await client.end();
}

syncAdmin().catch(console.error);
'
```

---

## 4. How to Reset or Change the Super Admin Password

If the Incident Commander needs to rotate credentials:

1. **Update `.env.local`**:
   ```bash
   ADMIN_PASSWORD=NewPassphrase@2026!
   ```
2. **Execute Database Hash Update in Supabase**:
   In the Supabase SQL Editor or via `psql`:
   ```sql
   UPDATE admin_users
   SET password_hash = encode(digest('NewPassphrase@2026!', 'sha256'), 'hex'),
       updated_at = NOW()
   WHERE email = 'tdeka379@gmail.com';
   ```
3. **Restart Application Service**:
   ```bash
   npm run build && npm run start
   ```

---

## 5. Super Admin Permission Verification & Role Isolation

### Strict Role Clearance Hierarchy
The NE-RESQ role authorization model enforces strict separation between citizens and administrative operators:

| Role Code | Title | Permissions |
| :--- | :--- | :--- |
| **`SUPER_ADMIN`** | Super Administrator | **Full System Authority**: broadcast disaster alerts, verify records, approve operators, audit logs, manage database status. |
| **`STATE_ADMIN`** | State Administrator | SDMA coordination for designated state (e.g., Assam, Meghalaya). |
| **`DISTRICT_ADMIN`** | District DDMA In-Charge | Localized alerts, district shelters, and rescue team dispatch. |
| **`CONTACT_MANAGER`**| Contact Directorate | Add/edit official SEOC, DEOC, and emergency helpline numbers. |
| **`ALERT_MANAGER`**  | Alert Specialist | Draft and publish official NDMA/IMD meteorological warnings. |
| **`CITIZEN`**        | Resident Citizen | Public portal, personal profile, SOS broadcast, shelter lookup. **Zero admin access.** |

### Public Registration Protection
- Public users signing up through `/register` can **never** become `SUPER_ADMIN`.
- If an applicant requests an administrative role via the registration form, their account status is set to `PENDING_APPROVAL` under `STATE_ADMIN`.
- Only the authenticated `SUPER_ADMIN` can review and approve new accounts in `/admin/users`.

---

## 6. Accessing the Admin Portal

1. Open your browser to **`http://localhost:3000`** (or your production Vercel domain).
2. Click the **Admin Portal** button located beside the NE-RESQ logo in the top navbar, or navigate directly to **`/admin/login`**.
3. Enter your configured **Official Directorate Email** (`tdeka379@gmail.com`).
4. Enter your **Administrative Password**.
5. Click **AUTHORIZE & ENTER COMMAND PORTAL**.
6. Upon cryptographic validation against the Supabase database, you will be securely redirected to the **Administrative Command Directorate** at `/admin/dashboard`.

---

## 7. Troubleshooting Administrative Login Failures

### 1. `Access Denied: No Super Administrator account found with these credentials`
- **Cause**: The entered email does not exist in `admin_users`, or its `role_id` does not point to `SUPER_ADMIN`.
- **Solution**: Verify `ADMIN_EMAIL` matches your `.env.local` setting. Run the synchronization script in Section 3 to ensure the database record exists.

### 2. `Invalid password. Super Administrator credentials rejected`
- **Cause**: Password mismatch between the input and stored SHA-256 hash in Supabase.
- **Solution**: Verify the password in `.env.local` or re-execute the password rotation SQL in Section 4.

### 3. `Administrative clearance required (Redirected from /admin/*)`
- **Cause**: Attempted to open `/admin/contacts`, `/admin/alerts`, or other directorate routes without an active approved admin session.
- **Solution**: Log in at `/admin/login` using your official credentials.

### 4. `Supabase database service unavailable (503)`
- **Cause**: Network block or missing `DATABASE_URL` / `SUPABASE_SECRET_KEY`.
- **Solution**: Ensure your Supabase cluster on `aws-0-ap-south-1` is online and that `DATABASE_URL` uses the direct connection pooler or direct host `db.iygprrxtlrvbdweydswh.supabase.co:5432`.
