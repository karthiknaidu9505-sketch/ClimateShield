import { Router } from 'express';
import { login } from '../controllers/authController.js';
import { getJurisdictions } from '../controllers/jurisdictionController.js';
import { getLocations, getLocationById } from '../controllers/locationController.js';
import { getRiskByLocationId, calculateCustomRisk } from '../controllers/riskController.js';
import { syncWeather, getLatestWeather } from '../controllers/weatherController.js';
import { 
  getIncidents, 
  getIncidentById, 
  createIncident, 
  updateIncident, 
  getIncidentActions, 
  updateIncidentAction, 
  addIncidentNote 
} from '../controllers/incidentController.js';
import { getTeams } from '../controllers/teamController.js';
import { getRiskHistory } from '../controllers/historyController.js';
import { requireAuth } from '../middlewares/authMiddleware.js';

const router = Router();

// ── Public Routes ─────────────────────────────────────────────
router.post('/auth/login', login);

// ── Protected Multi-Tenant Routes (Require Supabase JWT) ──────
router.use(requireAuth as any);

// Jurisdictions & Regional Multi-Tenancy (Scoped to authorized jurisdictions)
router.get('/jurisdictions', getJurisdictions);

// Locations & Vulnerable Sites (District-scoped with IDOR prevention)
router.get('/locations', getLocations);
router.get('/locations/:id', getLocationById);

// Risk Engine & Analytics
router.get('/risk/:locationId', getRiskByLocationId);
router.post('/risk/calculate', calculateCustomRisk);

// Emergency Incidents (District-scoped with IDOR protection)
router.get('/incidents', getIncidents);
router.get('/incidents/:id', getIncidentById);
router.post('/incidents', createIncident);
router.patch('/incidents/:id', updateIncident);

// Response Checklist Actions & Dispatch Radio Log
router.get('/incidents/:id/actions', getIncidentActions);
router.patch('/incidents/any/actions/:actionId', updateIncidentAction);
router.patch('/incidents/:id/actions/:actionId', updateIncidentAction);
router.post('/incidents/:id/notes', addIncidentNote);

// Response Units & Telemetry (District-scoped)
router.get('/teams', getTeams);

// Long-Term Risk History & Resilience Intelligence (District-scoped)
router.get('/history', getRiskHistory);

// Weather Ingestion & Synchronization
router.get('/weather/sync', syncWeather);
router.post('/weather/sync', syncWeather);
router.get('/weather/latest/:locationId', getLatestWeather);

export default router;
