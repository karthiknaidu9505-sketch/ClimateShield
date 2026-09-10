import app from './app.js';

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`====================================================`);
  console.log(`🛡️  ClimateShield Operational API Server Active`);
  console.log(`📍 Endpoint: http://localhost:${PORT}`);
  console.log(`📡 Telemetry & Ingestion: Online (Nominal)`);
  console.log(`====================================================`);
});
