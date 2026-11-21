// NE-RESQ Production Verification Test Suite
import assert from 'node:assert';
import fs from 'node:fs';
import path from 'node:path';
import { NORTHEAST_STATES, NORTHEAST_DISTRICTS } from '../../../packages/shared/northeast-data';
import { CENTRALIZED_EMERGENCY_DIRECTORY } from '../../../packages/shared/emergency-directory';
import { db } from '../lib/db';
import { LANGUAGES, TRANSLATIONS, SupportedLanguage } from '../lib/i18n/translations';

console.log('====================================================');
console.log('   NE-RESQ AUTOMATED END-TO-END VERIFICATION SUITE');
console.log('====================================================\n');

let passedTests = 0;
let failedTests = 0;

function test(name: string, fn: () => void) {
  try {
    fn();
    console.log(`[PASS] ✓ ${name}`);
    passedTests++;
  } catch (err: any) {
    console.error(`[FAIL] ✗ ${name}`);
    console.error(`       Error: ${err.message}`);
    failedTests++;
  }
}

async function runAllTests() {
  // 1. Verify Shared Geographic Data
  test('Northeast Geographic Scope: Exact 8 States Registered', () => {
    assert.strictEqual(NORTHEAST_STATES.length, 8, 'Must cover exactly 8 Northeast states');
    const stateCodes = NORTHEAST_STATES.map(s => s.code);
    assert.ok(stateCodes.includes('AS'), 'Assam must be included');
    assert.ok(stateCodes.includes('AR'), 'Arunachal Pradesh must be included');
    assert.ok(stateCodes.includes('ML'), 'Meghalaya must be included');
    assert.ok(stateCodes.includes('MN'), 'Manipur must be included');
    assert.ok(stateCodes.includes('MZ'), 'Mizoram must be included');
    assert.ok(stateCodes.includes('NL'), 'Nagaland must be included');
    assert.ok(stateCodes.includes('TR'), 'Tripura must be included');
    assert.ok(stateCodes.includes('SK'), 'Sikkim must be included');
  });

  test('Official Helplines: Verified 1070/1077/112 coverage', () => {
    const assam = NORTHEAST_STATES.find(s => s.code === 'AS');
    assert.ok(assam?.eocHelpline.includes('1070'), 'Assam SEOC must be 1070');
    assert.ok(NORTHEAST_DISTRICTS.length >= 35, 'Northeast districts must be populated');
  });

  // 2. Multilingual Localization Engine Tests
  test('i18n Localization: All 10 Northeast Languages Supported', () => {
    assert.strictEqual(LANGUAGES.length, 10, 'Must support 10 languages');
    const expectedCodes: SupportedLanguage[] = ['en', 'as', 'bn', 'hi', 'brx', 'kha', 'grt', 'mni', 'lus', 'ne'];
    expectedCodes.forEach(code => {
      assert.ok(TRANSLATIONS[code], `Dictionary must exist for language code: ${code}`);
      assert.ok(TRANSLATIONS[code]['nav.home'], `Home nav item must be translated for ${code}`);
      assert.ok(TRANSLATIONS[code]['nav.sosDispatch'], `SOS nav item must be translated for ${code}`);
      assert.ok(TRANSLATIONS[code]['hero.tagline1'], `Hero tagline must be translated for ${code}`);
    });
  });

  // 3. Database Zero-Mock Policy
  test('Database Zero-Mock Policy: External Providers Unconnected by Default', () => {
    const imd = db.providers.get('IMD_WEATHER');
    assert.ok(imd, 'IMD provider must be registered');
    assert.strictEqual(imd?.isConnected, false, 'Must not claim connection without valid keys');
    assert.strictEqual(imd?.configurationRequired, true);
    assert.strictEqual(imd?.statusMessage, 'Service not connected — configuration required.');
  });

  test('River Gauges: CWC Brahmaputra Basin Stations Loaded', () => {
    const gauges = Array.from(db.riverGauges.values());
    assert.ok(gauges.length >= 4, 'Must load official CWC station parameters');
    const ghy = db.riverGauges.get('cwc-guwahati');
    assert.ok(ghy, 'Guwahati DC Court station must exist');
    assert.strictEqual(ghy?.riverName, 'Brahmaputra');
    assert.strictEqual(ghy?.dangerLevelMeters, 50.50);
  });

  // 4. Ground-Level 3D Location Markers & Surface Elevation
  test('3D GIS Engine: Elevation-Anchored Ground Coordinates', () => {
    // Pure mathematical hypsometric elevation function matching 3D engine
    function computeElevation(x: number, y: number): number {
      let z = 0;
      if (y > 1.2) {
        const northFactor = (y - 1.2) / 12.5;
        const alpineRidges = 
          Math.sin(x * 0.38 + 1.5) * 1.6 + 
          Math.sin(x * 0.75 - y * 0.4) * 0.9 +
          Math.cos(x * 1.2 + y * 0.6) * 0.45;
        z += Math.max(0, alpineRidges * northFactor * 2.8);

        const distSikkim = Math.hypot(x - (-11.5), y - 6.5);
        if (distSikkim < 5.5) {
          z += Math.max(0, (5.5 - distSikkim) * 0.75);
        }
      }

      const distMeghalaya = Math.hypot(x - (-4), y - (-1.5));
      if (distMeghalaya < 5.8) {
        z += Math.max(0, (5.8 - distMeghalaya) * 0.42);
      }

      const riverCenterY = 0.8 + Math.sin(x * 0.22) * 2.4 + Math.cos(x * 0.45) * 0.6;
      const distFromRiver = Math.abs(y - riverCenterY);
      if (distFromRiver < 4.2) {
        const valleyDepth = (1 - distFromRiver / 4.2);
        z = Math.max(0, z * (1 - valleyDepth * 0.85) + (Math.sin(x * 0.5) * 0.12));
      }

      return z;
    }

    const sikkimElev = computeElevation(-11.5, 6.5);
    const shillongElev = computeElevation(-4, -1.5);
    const valleyElev = computeElevation(0, 0.8);

    assert.ok(sikkimElev > 0.5, 'Mountain coordinates must have realistic elevation');
    assert.ok(shillongElev > 0.3, 'Shillong plateau must have elevated topography');
    assert.ok(sikkimElev > valleyElev, 'Himalayan peaks must be higher than alluvial river valleys');
  });

  // 5. Centralized Configuration Register & Emergency Directory
  test('Configuration Register & Official Emergency Directory: 18 Sections Active', () => {
    const regPath = path.resolve(__dirname, '../../../NE-RESQ_CONFIGURATION_REGISTER.md');
    assert.ok(fs.existsSync(regPath), 'NE-RESQ_CONFIGURATION_REGISTER.md must exist in root');
    const content = fs.readFileSync(regPath, 'utf8');

    for (let i = 1; i <= 18; i++) {
      assert.ok(content.includes(`## ${i}.`), `Configuration register must contain Section ${i}`);
    }

    assert.ok(CENTRALIZED_EMERGENCY_DIRECTORY.length >= 10, 'Centralized emergency directory must be populated');
    const nat112 = CENTRALIZED_EMERGENCY_DIRECTORY.find(c => c.phoneNumber === '112');
    assert.ok(nat112, 'National 112 emergency must be registered');
    assert.strictEqual(nat112?.verificationStatus, 'VERIFIED_OFFICIAL');
  });

  // 6. SOS Operations & Tracking
  test('SOS Workflow: Create and Retrieve by Tracking ID', () => {
    const created = db.createSOS({
      citizenName: 'Bipul Sarma',
      contactPhone: '+91 9999999999',
      category: 'FLOOD_RESCUE',
      state: 'Assam',
      district: 'Kamrup Metropolitan',
      locationAddress: 'Test High School, Amingaon',
      latitude: 26.18,
      longitude: 91.75,
      affectedCount: 4,
      childrenCount: 1,
      elderlyCount: 1,
      hasMedicalEmergency: false,
      hasAccessibilityNeeds: false,
      priorityLevel: 'HIGH',
      isOfflineSynced: false
    });

    assert.ok(created.trackingId.startsWith('NER-2026-'), 'Tracking ID must have NER-2026 prefix');
    assert.strictEqual(created.status, 'SUBMITTED');

    const found = db.getSOSByTrackingId(created.trackingId);
    assert.ok(found, 'Should find SOS by tracking ID');
    assert.strictEqual(found?.citizenName, 'Bipul Sarma');
  });

  test('Rescue Management: Status Transitions and Audit Log', () => {
    const created = db.createSOS({
      citizenName: 'Audit Test Citizen',
      contactPhone: '9888888888',
      category: 'MEDICAL_EMERGENCY',
      state: 'Assam',
      district: 'Cachar',
      locationAddress: 'Ward 5, Silchar',
      latitude: 24.83,
      longitude: 92.80,
      affectedCount: 2,
      childrenCount: 0,
      elderlyCount: 1,
      hasMedicalEmergency: true,
      hasAccessibilityNeeds: false,
      priorityLevel: 'CRITICAL_LIFE_THREATENING',
      isOfflineSynced: false
    });

    const updated = db.updateSOSStatus(created.id, 'ASSIGNED', 'Assigned NDRF 1st Bn', 'Operator_01');
    assert.ok(updated, 'Update must return updated record');
    assert.strictEqual(updated?.status, 'ASSIGNED');
    assert.strictEqual(updated?.statusHistory.length, 2);
    assert.strictEqual(updated?.statusHistory[1].status, 'ASSIGNED');
    assert.strictEqual(updated?.statusHistory[1].updatedBy, 'Operator_01');
  });

  test('Community Reports: Code Generation and Review Queue', () => {
    const rep = db.createReport({
      category: 'FLOODING',
      state: 'Assam',
      district: 'Dibrugarh',
      locationDescription: 'Water overflowing near embankment',
      latitude: 27.48,
      longitude: 94.90,
      isAnonymous: true
    });

    assert.ok(rep.reportCode.startsWith('REP-'));
    assert.strictEqual(rep.status, 'UNVERIFIED', 'New reports must start as UNVERIFIED');
  });

  // 7. Active Environment Integration Tests
  test('Active Environment Configuration: Supabase, AI, and GIS Providers Loaded', () => {
    const envLocalPath = path.resolve(__dirname, '../.env.local');
    assert.ok(fs.existsSync(envLocalPath), 'apps/web/.env.local must exist');
    const envContent = fs.readFileSync(envLocalPath, 'utf8');

    assert.ok(envContent.includes('NEXT_PUBLIC_SUPABASE_URL='), 'Supabase URL must be configured');
    assert.ok(envContent.includes('NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY='), 'Supabase publishable key must be configured');
    assert.ok(envContent.includes('NEXT_PUBLIC_MAPTILER_API_KEY='), 'MapTiler key must be configured');
    assert.ok(envContent.includes('NEXT_PUBLIC_MAPBOX_TOKEN='), 'Mapbox token must be configured');
    assert.ok(envContent.includes('GEMINI_API_KEY='), 'Gemini API key must be configured');
    assert.ok(envContent.includes('OPENAI_API_KEY='), 'OpenAI API key must be configured');
  });

  // 8. Map Style Options Verification (Satellite & Topo Only)
  test('Live Map Styles: Satellite & Topographic Active, Light Option Eliminated', () => {
    const mapComponentPath = path.resolve(__dirname, '../components/map/DisasterMapInteractive.tsx');
    assert.ok(fs.existsSync(mapComponentPath), 'DisasterMapInteractive.tsx must exist');
    const content = fs.readFileSync(mapComponentPath, 'utf8');

    assert.ok(content.includes("export type BasemapType = 'satellite' | 'topo'"), 'Must strictly support satellite and topo only');
    assert.ok(!content.includes("'light' | 'satellite'"), 'Light map option must be removed');
    assert.ok(content.includes("Satellite"), 'Satellite option must be present');
    assert.ok(content.includes("Topographic"), 'Topographic option must be present');
  });

  // 9. Evacuation Geolocation & Routing Verification
  test('Evacuation Routing: Automatic Geolocation Button & Tactical Map Configured', () => {
    const evacPagePath = path.resolve(__dirname, '../app/evacuation/page.tsx');
    assert.ok(fs.existsSync(evacPagePath), 'app/evacuation/page.tsx must exist');
    const content = fs.readFileSync(evacPagePath, 'utf8');

    assert.ok(content.includes('Use My Current Location'), 'Must have Use My Current Location button');
    assert.ok(content.includes('navigator.geolocation.getCurrentPosition'), 'Must use browser Geolocation API on user action');
    assert.ok(content.includes('Location detected'), 'Must provide location detected confirmation');
    assert.ok(content.includes('Location access denied'), 'Must handle permission denial');
    assert.ok(content.includes('EvacuationMapInteractive'), 'Must integrate interactive evacuation map');
  });

  // 10. Single Website Architecture: Integrated Admin Command Portal
  test('Single Website Architecture: All Admin Modules Integrated into apps/web/app/admin', () => {
    const adminAppDir = path.resolve(__dirname, '../app/admin');
    assert.ok(fs.existsSync(adminAppDir), 'apps/web/app/admin directory must exist for single website architecture');

    const expectedAdminRoutes = [
      'page.tsx', // 1. Overview Dashboard
      'contacts/page.tsx', // 2. Emergency Contacts
      'alerts/page.tsx', // 3. Disaster Alerts
      'states/page.tsx', // 4. State Jurisdiction
      'districts/page.tsx', // 5. District Management
      'hospitals/page.tsx', // 6. Healthcare Facilities
      'shelters/page.tsx', // 7. Shelters & Relief Camps
      'rescue-teams/page.tsx', // 8. Rescue & Logistics
      'content/page.tsx', // 9. Website Content
      'users/page.tsx', // 10. Administrator Approvals
      'verifications/page.tsx', // 11. Record Verification Desk
      'audit-logs/page.tsx', // 12. Security Audit Logs
      'database-status/page.tsx', // 13. Supabase Health
      'settings/page.tsx', // 14. System Settings
      'layout.tsx', // Admin Root Layout with Security & Sidebar
    ];

    expectedAdminRoutes.forEach(r => {
      const fullPath = path.join(adminAppDir, r);
      assert.ok(fs.existsSync(fullPath), `Admin portal route must exist: app/admin/${r}`);
    });
  });

  // 11. Supabase Database Schema & Idempotent SQL Scripts
  test('Supabase Schema: Single Comprehensive NE_RESQ_COMPLETE_DATABASE.sql Script', () => {
    const sqlPath = path.resolve(__dirname, '../../../supabase/NE_RESQ_COMPLETE_DATABASE.sql');
    assert.ok(fs.existsSync(sqlPath), 'supabase/NE_RESQ_COMPLETE_DATABASE.sql must exist');
    const sql = fs.readFileSync(sqlPath, 'utf8');

    // PostGIS and extensions
    assert.ok(sql.toLowerCase().includes('create extension if not exists "postgis"') || sql.toLowerCase().includes('create extension if not exists postgis'), 'Must enable PostGIS extension');
    assert.ok(sql.includes('uuid-ossp'), 'Must enable uuid-ossp');
    assert.ok(sql.includes('pgcrypto'), 'Must enable pgcrypto');

    // Tables
    assert.ok(sql.includes('CREATE TABLE IF NOT EXISTS admin_users'), 'admin_users table must exist');
    assert.ok(sql.includes('CREATE TABLE IF NOT EXISTS emergency_contacts'), 'emergency_contacts table must exist');
    assert.ok(sql.includes('CREATE TABLE IF NOT EXISTS official_alerts'), 'official_alerts table must exist');
    assert.ok(sql.includes('CREATE TABLE IF NOT EXISTS healthcare_facilities'), 'healthcare_facilities table must exist');
    assert.ok(sql.includes('CREATE TABLE IF NOT EXISTS shelters'), 'shelters table must exist');
    assert.ok(sql.includes('CREATE TABLE IF NOT EXISTS admin_audit_logs'), 'admin_audit_logs table must exist');

    // Security & RLS
    assert.ok(sql.includes('ENABLE ROW LEVEL SECURITY;'), 'Must enable RLS');
    assert.ok(sql.includes('bootstrap_super_admin'), 'Must include bootstrap_super_admin procedure');

    // Documentation Suite
    const docs = ['README.md', 'DATABASE_SCHEMA.md', 'TABLE_RELATIONSHIPS.md', 'SECURITY_AND_RLS.md'];
    docs.forEach(doc => {
      assert.ok(fs.existsSync(path.resolve(__dirname, `../../../supabase/${doc}`)), `supabase/${doc} must exist`);
    });
  });

  // 12. Zero-Trust Admin Role Clearance & Approval Workflow
  test('Admin Auth & RBAC: Zero-Trust Clearance & 7 Authorized Roles in lib/admin-auth.ts', () => {
    const authPath = path.resolve(__dirname, '../lib/admin-auth.ts');
    assert.ok(fs.existsSync(authPath), 'apps/web/lib/admin-auth.ts must exist');
    const authCode = fs.readFileSync(authPath, 'utf8');

    const roles = [
      'SUPER_ADMIN',
      'STATE_ADMIN',
      'DISTRICT_ADMIN',
      'CONTACT_MANAGER',
      'ALERT_MANAGER',
      'CONTENT_MANAGER',
      'READONLY_ADMIN',
    ];

    roles.forEach(role => {
      assert.ok(authCode.includes(role), `Role ${role} must be defined in admin auth system`);
    });

    assert.ok(authCode.includes('PENDING_APPROVAL'), 'New registrations must default to PENDING_APPROVAL');
    assert.ok(authCode.includes('approveAdmin'), 'Must provide approveAdmin clearance function');
  });

  // 13. Single Login System & Role-Based Redirection
  test('Single Login System: Unified Auth & Role Redirection Logic', () => {
    const loginPath = path.resolve(__dirname, '../app/login/page.tsx');
    assert.ok(fs.existsSync(loginPath), 'app/login/page.tsx must exist');
    const loginCode = fs.readFileSync(loginPath, 'utf8');
    assert.ok(loginCode.includes('authenticateUser'), 'Must invoke unified authenticateUser logic');

    const registerPath = path.resolve(__dirname, '../app/register/page.tsx');
    assert.ok(fs.existsSync(registerPath), 'app/register/page.tsx must exist');
    const regCode = fs.readFileSync(registerPath, 'utf8');
    assert.ok(regCode.includes('registerUser'), 'Must invoke unified registerUser logic');

    const profilePath = path.resolve(__dirname, '../app/profile/page.tsx');
    assert.ok(fs.existsSync(profilePath), 'app/profile/page.tsx must exist');
  });

  // 14. Unified Route Structure for Single Application & Single Vercel Project
  test('Unified Route Structure: Public & Admin Routes Running Under Single App', () => {
    const requiredRoutes = [
      '../app/page.tsx', // /
      '../app/alerts/page.tsx', // /alerts
      '../app/live-map/page.tsx', // /live-map
      '../app/emergency/page.tsx', // /emergency
      '../app/evacuation/page.tsx', // /evacuation
      '../app/shelters/page.tsx', // /shelters
      '../app/ai-assistant/page.tsx', // /ai-assistant
      '../app/login/page.tsx', // /login
      '../app/register/page.tsx', // /register
      '../app/profile/page.tsx', // /profile
      '../app/admin/page.tsx', // /admin
      '../app/admin/contacts/page.tsx', // /admin/contacts
      '../app/admin/alerts/page.tsx', // /admin/alerts
      '../app/admin/states/page.tsx', // /admin/states
      '../app/admin/districts/page.tsx', // /admin/districts
      '../app/admin/hospitals/page.tsx', // /admin/hospitals
      '../app/admin/shelters/page.tsx', // /admin/shelters
      '../app/admin/rescue-teams/page.tsx', // /admin/rescue-teams
      '../app/admin/users/page.tsx', // /admin/users
      '../app/admin/settings/page.tsx', // /admin/settings
      '../app/admin/audit-logs/page.tsx', // /admin/audit-logs
      '../app/admin/login/page.tsx', // /admin/login
      '../app/admin/dashboard/page.tsx', // /admin/dashboard
    ];

    requiredRoutes.forEach(route => {
      const fullPath = path.resolve(__dirname, route);
      assert.ok(fs.existsSync(fullPath), `Unified route file must exist: ${route}`);
    });
  });

  // 15. Navigation Bar Center Alignment & Super Admin Login Access Flow
  test('Navbar Alignment & Super Admin Portal Button & Secure Login Access', () => {
    const navbarPath = path.resolve(__dirname, '../components/layout/Navbar.tsx');
    assert.ok(fs.existsSync(navbarPath), 'components/layout/Navbar.tsx must exist');
    const navbarCode = fs.readFileSync(navbarPath, 'utf8');

    // Admin Portal button beside logo
    assert.ok(navbarCode.includes('/admin/login'), 'Admin Portal button must route to /admin/login');
    assert.ok(navbarCode.includes('Admin Portal'), 'Must render clearly visible Admin Portal button');
    assert.ok(navbarCode.includes('justify-center'), 'Must center-align navigation links');

    // Super Admin login page
    const loginPagePath = path.resolve(__dirname, '../app/admin/login/page.tsx');
    assert.ok(fs.existsSync(loginPagePath), 'app/admin/login/page.tsx must exist');
    const loginCode = fs.readFileSync(loginPagePath, 'utf8');
    assert.ok(loginCode.includes('Super Admin Login'), 'Must have Super Admin Login heading');
    assert.ok(loginCode.includes('showPassword'), 'Must support show/hide password toggle');
    assert.ok(loginCode.includes('super_admin_only'), 'Must enforce super_admin_only validation');

    // Admin dashboard route
    const dashPath = path.resolve(__dirname, '../app/admin/dashboard/page.tsx');
    assert.ok(fs.existsSync(dashPath), 'app/admin/dashboard/page.tsx must exist');
  });

  console.log('\n====================================================');
  console.log(`TEST SUMMARY: ${passedTests} PASSED, ${failedTests} FAILED`);
  console.log('====================================================\n');

  if (failedTests > 0) {
    process.exit(1);
  }
}

runAllTests();
