import app from './app.js';
import http from 'http';

interface TestResult {
  name: string;
  expectedStatus: number;
  actualStatus: number;
  passed: boolean;
  details: string;
}

const results: TestResult[] = [];

async function runTests() {
  const server = http.createServer(app);
  await new Promise<void>((resolve) => server.listen(0, resolve));
  const port = (server.address() as any).port;
  const baseUrl = `http://localhost:${port}/api`;

  console.log(`\n===============================================================`);
  console.log(`CLIMATESHIELD MULTI-TENANT AUTH & DISTRICT ISOLATION TEST SUITE`);
  console.log(`Server listening on port ${port}`);
  console.log(`===============================================================\n`);

  async function req(path: string, options: RequestInit = {}) {
    const res = await fetch(`${baseUrl}${path}`, options);
    let body: any;
    try {
      body = await res.json();
    } catch {
      body = null;
    }
    return { status: res.status, body };
  }

  function record(name: string, expectedStatus: number, actualStatus: number, details: string) {
    const passed = expectedStatus === actualStatus;
    results.push({ name, expectedStatus, actualStatus, passed, details });
    const mark = passed ? '✅ PASS' : '❌ FAIL';
    console.log(`${mark} [${actualStatus === expectedStatus ? actualStatus : `${actualStatus} vs exp ${expectedStatus}`}] ${name} - ${details}`);
  }

  try {
    // ── 1. Valid Login - Amalapuram Operator (Elena Vance) ──────
    const elenaLogin = await req('/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'admin@climateshield.demo', password: 'demo123' })
    });
    const elenaToken = elenaLogin.body?.token;
    record(
      '1. Valid Login (Elena Vance - Amalapuram)',
      200,
      elenaLogin.status,
      `Token acquired (len ${elenaToken?.length}), jurisdiction: ${elenaLogin.body?.user?.primaryJurisdictionId}`
    );

    // ── 2. Valid Login - Tuni Operator (Ravi Kumar) ──────────────
    const raviLogin = await req('/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'operator.tuni@climateshield.demo', password: 'demo123' })
    });
    const raviToken = raviLogin.body?.token;
    record(
      '2. Valid Login (Ravi Kumar - Tuni)',
      200,
      raviLogin.status,
      `Token acquired (len ${raviToken?.length}), jurisdiction: ${raviLogin.body?.user?.primaryJurisdictionId}`
    );

    // ── 3. Invalid Password ─────────────────────────────────────
    const invalidLogin = await req('/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'admin@climateshield.demo', password: 'wrongpassword' })
    });
    record(
      '3. Invalid Password Handling',
      401,
      invalidLogin.status,
      `Rejection message: "${invalidLogin.body?.error}"`
    );

    // ── 4. Unauthenticated Request ──────────────────────────────
    const noAuth = await req('/locations');
    record(
      '4. Unauthenticated Access (No Token)',
      401,
      noAuth.status,
      `Rejection message: "${noAuth.body?.error}"`
    );

    // ── 5. Invalid / Fake Token ─────────────────────────────────
    const badToken = await req('/locations', {
      headers: { Authorization: 'Bearer fake-invalid-token-12345' }
    });
    record(
      '5. Invalid Token Handling',
      401,
      badToken.status,
      `Rejection message: "${badToken.body?.error}"`
    );

    // ── 6. Authorized District Access (Amalapuram) ──────────────
    const elenaLocations = await req('/locations', {
      headers: { Authorization: `Bearer ${elenaToken}` }
    });
    const elenaLocNames = elenaLocations.body?.data?.map((l: any) => l.name) || [];
    const allAmalapuramLocs = elenaLocations.body?.data?.every((l: any) => l.jurisdictionId === 'jur-amalapuram-region');
    record(
      '6. Authorized Access: Amalapuram Operator -> Locations',
      200,
      elenaLocations.status,
      `Returned ${elenaLocations.body?.count} locations (${elenaLocNames.join(', ')}). All Amalapuram: ${allAmalapuramLocs}`
    );

    const elenaIncidents = await req('/incidents', {
      headers: { Authorization: `Bearer ${elenaToken}` }
    });
    const allAmalapuramIncs = elenaIncidents.body?.data?.every((i: any) => i.jurisdictionId === 'jur-amalapuram-region');
    record(
      '7. Authorized Access: Amalapuram Operator -> Incidents',
      200,
      elenaIncidents.status,
      `Returned ${elenaIncidents.body?.count} incidents. All Amalapuram: ${allAmalapuramIncs}`
    );

    const elenaTeams = await req('/teams', {
      headers: { Authorization: `Bearer ${elenaToken}` }
    });
    const allAmalapuramTeams = elenaTeams.body?.data?.every((t: any) => t.jurisdictionId === 'jur-amalapuram-region');
    record(
      '8. Authorized Access: Amalapuram Operator -> Teams',
      200,
      elenaTeams.status,
      `Returned ${elenaTeams.body?.count} teams. All Amalapuram: ${allAmalapuramTeams}`
    );

    const elenaHistory = await req('/history', {
      headers: { Authorization: `Bearer ${elenaToken}` }
    });
    record(
      '9. Authorized Access: Amalapuram Operator -> History',
      200,
      elenaHistory.status,
      `Jurisdiction: ${elenaHistory.body?.jurisdictionId}, total incidents: ${elenaHistory.body?.summary?.totalIncidents}`
    );

    // ── 7. Authorized District Access (Tuni) ────────────────────
    const raviLocations = await req('/locations', {
      headers: { Authorization: `Bearer ${raviToken}` }
    });
    const raviLocNames = raviLocations.body?.data?.map((l: any) => l.name) || [];
    const allTuniLocs = raviLocations.body?.data?.every((l: any) => l.jurisdictionId === 'jur-tuni-district');
    record(
      '10. Authorized Access: Tuni Operator -> Locations',
      200,
      raviLocations.status,
      `Returned ${raviLocations.body?.count} locations (${raviLocNames.join(', ')}). All Tuni: ${allTuniLocs}`
    );

    const raviIncidents = await req('/incidents', {
      headers: { Authorization: `Bearer ${raviToken}` }
    });
    const allTuniIncs = raviIncidents.body?.data?.every((i: any) => i.jurisdictionId === 'jur-tuni-district');
    record(
      '11. Authorized Access: Tuni Operator -> Incidents',
      200,
      raviIncidents.status,
      `Returned ${raviIncidents.body?.count} incidents. All Tuni: ${allTuniIncs}`
    );

    const raviTeams = await req('/teams', {
      headers: { Authorization: `Bearer ${raviToken}` }
    });
    const allTuniTeams = raviTeams.body?.data?.every((t: any) => t.jurisdictionId === 'jur-tuni-district');
    record(
      '12. Authorized Access: Tuni Operator -> Teams',
      200,
      raviTeams.status,
      `Returned ${raviTeams.body?.count} teams. All Tuni: ${allTuniTeams}`
    );

    const raviHistory = await req('/history', {
      headers: { Authorization: `Bearer ${raviToken}` }
    });
    record(
      '13. Authorized Access: Tuni Operator -> History',
      200,
      raviHistory.status,
      `Jurisdiction: ${raviHistory.body?.jurisdictionId}, total incidents: ${raviHistory.body?.summary?.totalIncidents}`
    );

    // ── 8. Cross-District IDOR Tests: Query Param Override ──────
    const elenaQueryTuni = await req('/locations?jurisdictionId=jur-tuni-district', {
      headers: { Authorization: `Bearer ${elenaToken}` }
    });
    record(
      '14. IDOR Defense: Amalapuram Operator requesting ?jurisdictionId=jur-tuni-district',
      403,
      elenaQueryTuni.status,
      `Server response: "${elenaQueryTuni.body?.error}"`
    );

    const raviQueryAmalapuram = await req('/locations?jurisdictionId=jur-amalapuram-region', {
      headers: { Authorization: `Bearer ${raviToken}` }
    });
    record(
      '15. IDOR Defense: Tuni Operator requesting ?jurisdictionId=jur-amalapuram-region',
      403,
      raviQueryAmalapuram.status,
      `Server response: "${raviQueryAmalapuram.body?.error}"`
    );

    // ── 9. Cross-District IDOR Tests: Direct Location URL ───────
    const elenaGetTuniLoc = await req('/locations/loc-tuni-junction', {
      headers: { Authorization: `Bearer ${elenaToken}` }
    });
    record(
      '16. IDOR Defense: Amalapuram Operator -> GET /locations/loc-tuni-junction',
      403,
      elenaGetTuniLoc.status,
      `Server response: "${elenaGetTuniLoc.body?.error}"`
    );

    const raviGetAmalapuramLoc = await req('/locations/loc-railway-underpass', {
      headers: { Authorization: `Bearer ${raviToken}` }
    });
    record(
      '17. IDOR Defense: Tuni Operator -> GET /locations/loc-railway-underpass',
      403,
      raviGetAmalapuramLoc.status,
      `Server response: "${raviGetAmalapuramLoc.body?.error}"`
    );

    // ── 10. Cross-District IDOR Tests: Direct Incident URL ──────
    const elenaGetTuniInc = await req('/incidents/inc-tuni-001', {
      headers: { Authorization: `Bearer ${elenaToken}` }
    });
    record(
      '18. IDOR Defense: Amalapuram Operator -> GET /incidents/inc-tuni-001',
      403,
      elenaGetTuniInc.status,
      `Server response: "${elenaGetTuniInc.body?.error}"`
    );

    const raviGetAmalapuramInc = await req('/incidents/inc-railway-001', {
      headers: { Authorization: `Bearer ${raviToken}` }
    });
    record(
      '19. IDOR Defense: Tuni Operator -> GET /incidents/inc-railway-001',
      403,
      raviGetAmalapuramInc.status,
      `Server response: "${raviGetAmalapuramInc.body?.error}"`
    );

    // ── 11. Cross-District IDOR Tests: Incident Modification ────
    const elenaModifyTuniInc = await req('/incidents/inc-tuni-001', {
      method: 'PATCH',
      headers: {
        Authorization: `Bearer ${elenaToken}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ status: 'RESOLVED' })
    });
    record(
      '20. IDOR Defense: Amalapuram Operator -> PATCH /incidents/inc-tuni-001',
      403,
      elenaModifyTuniInc.status,
      `Server response: "${elenaModifyTuniInc.body?.error}"`
    );

    const raviModifyAmalapuramInc = await req('/incidents/inc-railway-001', {
      method: 'PATCH',
      headers: {
        Authorization: `Bearer ${raviToken}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ status: 'RESOLVED' })
    });
    record(
      '21. IDOR Defense: Tuni Operator -> PATCH /incidents/inc-railway-001',
      403,
      raviModifyAmalapuramInc.status,
      `Server response: "${raviModifyAmalapuramInc.body?.error}"`
    );

    // ── 12. Cross-District IDOR Tests: Incident Notes ───────────
    const elenaNoteTuniInc = await req('/incidents/inc-tuni-001/notes', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${elenaToken}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ message: 'Unauthorized note attempt from Amalapuram' })
    });
    record(
      '22. IDOR Defense: Amalapuram Operator -> POST /incidents/inc-tuni-001/notes',
      403,
      elenaNoteTuniInc.status,
      `Server response: "${elenaNoteTuniInc.body?.error}"`
    );

    // ── 13. Cross-District IDOR Tests: Risk Analytics ───────────
    const elenaRiskTuni = await req('/risk/loc-tuni-junction', {
      headers: { Authorization: `Bearer ${elenaToken}` }
    });
    record(
      '23. IDOR Defense: Amalapuram Operator -> GET /risk/loc-tuni-junction',
      403,
      elenaRiskTuni.status,
      `Server response: "${elenaRiskTuni.body?.error}"`
    );

    const raviRiskAmalapuram = await req('/risk/loc-railway-underpass', {
      headers: { Authorization: `Bearer ${raviToken}` }
    });
    record(
      '24. IDOR Defense: Tuni Operator -> GET /risk/loc-railway-underpass',
      403,
      raviRiskAmalapuram.status,
      `Server response: "${raviRiskAmalapuram.body?.error}"`
    );

    // ── 14. Cross-District IDOR Tests: Weather Telemetry ────────
    const elenaWeatherTuni = await req('/weather/latest/loc-tuni-junction', {
      headers: { Authorization: `Bearer ${elenaToken}` }
    });
    record(
      '25. IDOR Defense: Amalapuram Operator -> GET /weather/latest/loc-tuni-junction',
      403,
      elenaWeatherTuni.status,
      `Server response: "${elenaWeatherTuni.body?.error}"`
    );

    // ── 15. Cross-District IDOR Tests: History ──────────────────
    const elenaHistoryTuni = await req('/history?jurisdictionId=jur-tuni-district', {
      headers: { Authorization: `Bearer ${elenaToken}` }
    });
    record(
      '26. IDOR Defense: Amalapuram Operator -> GET /history?jurisdictionId=jur-tuni-district',
      403,
      elenaHistoryTuni.status,
      `Server response: "${elenaHistoryTuni.body?.error}"`
    );

    const raviHistoryAmalapuram = await req('/history?jurisdictionId=jur-amalapuram-region', {
      headers: { Authorization: `Bearer ${raviToken}` }
    });
    record(
      '27. IDOR Defense: Tuni Operator -> GET /history?jurisdictionId=jur-amalapuram-region',
      403,
      raviHistoryAmalapuram.status,
      `Server response: "${raviHistoryAmalapuram.body?.error}"`
    );

    // ── 16. Existing Application Functionality Verification ────
    const healthCheck = await req('/health');
    record(
      '28. Application Health: GET /api/health',
      200,
      healthCheck.status,
      `Status: "${healthCheck.body?.status}", database: "${healthCheck.body?.database}"`
    );

    const weatherSync = await req('/weather/sync', {
      headers: { Authorization: `Bearer ${elenaToken}` }
    });
    record(
      '29. Weather Synchronization: GET /api/weather/sync',
      200,
      weatherSync.status,
      `Sync successful: ${weatherSync.body?.success}, synced locations: ${weatherSync.body?.syncedCount}`
    );

    const riskCalc = await req('/risk/calculate', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${elenaToken}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ rainfallMm: 85, waterLevelCm: 42, drainageCondition: 'Poor', historicalIncidents: 12 })
    });
    record(
      '30. Risk Engine Calculation: POST /api/risk/calculate',
      200,
      riskCalc.status,
      `Computed score: ${riskCalc.body?.data?.riskScore}, level: "${riskCalc.body?.data?.riskLevel}"`
    );

    // Get an action from Elena's incident
    const elenaIncActions = await req('/incidents/inc-railway-001/actions', {
      headers: { Authorization: `Bearer ${elenaToken}` }
    });
    const firstActionId = elenaIncActions.body?.data?.[0]?.id || 'act-01';
    const toggleActionRes = await req(`/incidents/any/actions/${firstActionId}`, {
      method: 'PATCH',
      headers: {
        Authorization: `Bearer ${elenaToken}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ isCompleted: true })
    });
    record(
      '31. Incident Action Updates: PATCH /incidents/any/actions/:actionId',
      200,
      toggleActionRes.status,
      `Action '${firstActionId}' updated. isCompleted: ${toggleActionRes.body?.data?.isCompleted}`
    );

  } finally {
    server.close();
  }

  const passedCount = results.filter(r => r.passed).length;
  const totalCount = results.length;

  console.log(`\n===============================================================`);
  console.log(`FINAL RESULT: ${passedCount} / ${totalCount} TESTS PASSED`);
  console.log(`===============================================================\n`);

  if (passedCount !== totalCount) {
    process.exit(1);
  }
}

runTests().catch(err => {
  console.error('Fatal test error:', err);
  process.exit(1);
});
