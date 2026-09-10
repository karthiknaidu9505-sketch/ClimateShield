import { Router } from 'express';
import { login } from '../controllers/authController.js';
import { getLocations, getLocationById } from '../controllers/locationController.js';
import { getRiskByLocationId, calculateCustomRisk } from '../controllers/riskController.js';
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

const router = Router();

// Authentication
router.post('/auth/login', login);

// Locations
router.get('/locations', getLocations);
router.get('/locations/:id', getLocationById);

// Risk Engine
router.get('/risk/:locationId', getRiskByLocationId);
router.post('/risk/calculate', calculateCustomRisk);

// Incidents
router.get('/incidents', getIncidents);
router.get('/incidents/:id', getIncidentById);
router.post('/incidents', createIncident);
router.patch('/incidents/:id', updateIncident);

// Response Actions
router.get('/incidents/:id/actions', getIncidentActions);
router.patch('/incidents/:id/actions/:actionId', updateIncidentAction);
router.post('/incidents/:id/notes', addIncidentNote);

// Teams
router.get('/teams', getTeams);

// Risk History & Analytics
router.get('/history', getRiskHistory);

export default router;
