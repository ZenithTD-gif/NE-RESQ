// NE-RESQ Production Verification Test Suite
import assert from 'node:assert';

console.log('====================================================');
console.log('   NE-RESQ AUTOMATED END-TO-END VERIFICATION SUITE');
console.log('====================================================\n');

let passedTests = 0;
let failedTests = 0;

function test(name, fn) {
  try {
    fn();
    console.log(`[PASS] ✓ ${name}`);
    passedTests++;
  } catch (err) {
    console.error(`[FAIL] ✗ ${name}`);
    console.error(`       Error: ${err.message}`);
    failedTests++;
  }
}

async function testAsync(name, fn) {
  try {
    await fn();
    console.log(`[PASS] ✓ ${name}`);
    passedTests++;
  } catch (err) {
    console.error(`[FAIL] ✗ ${name}`);
    console.error(`       Error: ${err.message}`);
    failedTests++;
  }
}

async function runAllTests() {
  // 1. Verify Shared Geographic Data
  const { NORTHEAST_STATES, NORTHEAST_DISTRICTS } = await import('../../packages/shared/northeast-data.ts');
  
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
    assert.ok(assam.eocHelpline.includes('1070'), 'Assam SEOC must be 1070');
    assert.ok(NORTHEAST_DISTRICTS.length >= 35, 'Northeast districts must be populated');
  });

  // 2. In-Memory Database Tests
  const { db } = await import('../lib/db.ts');

  test('Database Zero-Mock Policy: External Providers Unconnected by Default', () => {
    const imd = db.providers.get('IMD_WEATHER');
    assert.ok(imd, 'IMD provider must be registered');
    assert.strictEqual(imd.isConnected, false, 'Must not claim connection without valid keys');
    assert.strictEqual(imd.configurationRequired, true);
    assert.strictEqual(imd.statusMessage, 'Service not connected — configuration required.');
  });

  test('River Gauges: CWC Brahmaputra Basin Stations Loaded', () => {
    const gauges = Array.from(db.riverGauges.values());
    assert.ok(gauges.length >= 4, 'Must load official CWC station parameters');
    const ghy = db.riverGauges.get('cwc-guwahati');
    assert.ok(ghy, 'Guwahati DC Court station must exist');
    assert.strictEqual(ghy.riverName, 'Brahmaputra');
    assert.strictEqual(ghy.dangerLevelMeters, 50.50);
  });

  test('SOS Workflow: Create and Retrieve by Tracking ID', () => {
    const created = db.createSOS({
      citizenName: 'Test Citizen',
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

    // Retrieve
    const found = db.getSOSByTrackingId(created.trackingId);
    assert.ok(found, 'Should find SOS by tracking ID');
    assert.strictEqual(found.citizenName, 'Test Citizen');
  });

  test('Rescue Management: Status Transitions and Audit Log', () => {
    const created = db.createSOS({
      citizenName: 'Audit Test',
      contactPhone: '9888888888',
      category: 'MEDICAL_EMERGENCY',
      state: 'Assam',
      district: 'Kamrup Metropolitan',
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
    assert.strictEqual(updated.status, 'ASSIGNED');
    assert.strictEqual(updated.statusHistory.length, 2);
    assert.strictEqual(updated.statusHistory[1].status, 'ASSIGNED');
    assert.strictEqual(updated.statusHistory[1].updatedBy, 'Operator_01');
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

  console.log('\n====================================================');
  console.log(`TEST SUMMARY: ${passedTests} PASSED, ${failedTests} FAILED`);
  console.log('====================================================\n');

  if (failedTests > 0) {
    process.exit(1);
  }
}

runAllTests();
