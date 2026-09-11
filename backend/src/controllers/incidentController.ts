import { Response } from 'express';
import { IncidentService } from '../services/incidents/incidentService.js';
import { LocationService } from '../services/locations/locationService.js';
import { AuthenticatedRequest, isAuthorizedForJurisdiction } from '../middlewares/authMiddleware.js';
import { prisma } from '../config/db.js';

export const getIncidents = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const requestedJurisdictionId = req.query.jurisdictionId as string | undefined;

    if (requestedJurisdictionId) {
      if (!isAuthorizedForJurisdiction(req, requestedJurisdictionId)) {
        return res.status(403).json({
          success: false,
          error: `Forbidden: You are not authorized to access incidents for jurisdiction '${requestedJurisdictionId}'.`
        });
      }
      const incidents = await IncidentService.getAllIncidents(requestedJurisdictionId);
      return res.json({ success: true, count: incidents.length, data: incidents });
    }

    const allowedJurisdictions = req.user?.authorizedJurisdictionIds || [];
    const incidents = await IncidentService.getAllIncidents(undefined, allowedJurisdictions);
    return res.json({ success: true, count: incidents.length, data: incidents });
  } catch (error: any) {
    console.error('Error fetching incidents:', error);
    return res.status(500).json({ success: false, error: 'Failed to retrieve incidents.' });
  }
};

export const getIncidentById = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { id } = req.params;
    const incident = await IncidentService.getIncidentById(id);

    if (!incident) {
      return res.status(404).json({ success: false, error: `Incident '${id}' not found.` });
    }

    // IDOR Protection: verify incident belongs to user's authorized jurisdiction
    if (!isAuthorizedForJurisdiction(req, incident.jurisdictionId)) {
      return res.status(403).json({
        success: false,
        error: `Forbidden: You are not authorized to access incident '${id}' in another district.`
      });
    }

    return res.json({ success: true, data: incident });
  } catch (error: any) {
    console.error('Error fetching incident:', error);
    return res.status(500).json({ success: false, error: 'Failed to retrieve incident.' });
  }
};

export const createIncident = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { locationId, title, severity, riskScore, responseTeamId, summary } = req.body;

    if (!locationId) {
      return res.status(400).json({ success: false, error: 'locationId is required to declare an incident.' });
    }

    const location = await LocationService.getLocationById(locationId);
    if (!location) {
      return res.status(404).json({ success: false, error: `Location '${locationId}' not found.` });
    }

    // IDOR Protection: ensure location belongs to caller's authorized jurisdiction
    if (!isAuthorizedForJurisdiction(req, location.jurisdictionId)) {
      return res.status(403).json({
        success: false,
        error: `Forbidden: Cannot declare incident at location '${locationId}' in another district.`
      });
    }

    const newIncident = await IncidentService.createIncident({
      locationId,
      jurisdictionId: location.jurisdictionId,
      title,
      severity,
      riskScore: riskScore ? Number(riskScore) : undefined,
      responseTeamId,
      summary,
      declaredById: req.user?.id
    });

    return res.status(201).json({ success: true, data: newIncident });
  } catch (error: any) {
    console.error('Error creating incident:', error);
    return res.status(500).json({ success: false, error: error.message || 'Failed to create incident.' });
  }
};

export const updateIncident = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { id } = req.params;
    const { status, responseTeamId, severity } = req.body;

    const incident = await IncidentService.getIncidentById(id);
    if (!incident) {
      return res.status(404).json({ success: false, error: `Incident '${id}' not found.` });
    }

    // IDOR Protection
    if (!isAuthorizedForJurisdiction(req, incident.jurisdictionId)) {
      return res.status(403).json({
        success: false,
        error: `Forbidden: You are not authorized to modify incident '${id}' in another district.`
      });
    }

    // If assigning response team, verify team belongs to same jurisdiction
    if (responseTeamId) {
      const team = await prisma.responseTeam.findUnique({ where: { id: responseTeamId } });
      if (!team || team.jurisdictionId !== incident.jurisdictionId) {
        return res.status(400).json({
          success: false,
          error: `Response team '${responseTeamId}' does not belong to incident district '${incident.jurisdictionId}'.`
        });
      }
    }

    const updated = await IncidentService.updateIncident(id, {
      status,
      responseTeamId,
      severity
    });

    return res.json({ success: true, data: updated });
  } catch (error: any) {
    console.error('Error updating incident:', error);
    return res.status(500).json({ success: false, error: 'Failed to update incident.' });
  }
};

export const getIncidentActions = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { id } = req.params;
    const incident = await IncidentService.getIncidentById(id);

    if (!incident) {
      return res.status(404).json({ success: false, error: `Incident '${id}' not found.` });
    }

    if (!isAuthorizedForJurisdiction(req, incident.jurisdictionId)) {
      return res.status(403).json({
        success: false,
        error: `Forbidden: You are not authorized to view actions for incident '${id}'.`
      });
    }

    return res.json({ success: true, data: incident.actions });
  } catch (error: any) {
    console.error('Error getting incident actions:', error);
    return res.status(500).json({ success: false, error: 'Failed to retrieve actions.' });
  }
};

export const updateIncidentAction = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { actionId } = req.params;
    const { isCompleted } = req.body;

    if (isCompleted === undefined) {
      return res.status(400).json({ success: false, error: 'isCompleted (boolean) is required.' });
    }

    // Find action and its parent incident to verify jurisdiction
    const action = await prisma.responseAction.findUnique({
      where: { id: actionId },
      include: { incident: true }
    });

    if (!action) {
      return res.status(404).json({ success: false, error: `Action '${actionId}' not found.` });
    }

    if (!isAuthorizedForJurisdiction(req, action.incident.jurisdictionId)) {
      return res.status(403).json({
        success: false,
        error: `Forbidden: You are not authorized to modify action items in another district.`
      });
    }

    const updatedAction = await IncidentService.toggleAction(actionId, Boolean(isCompleted));
    return res.json({ success: true, data: updatedAction });
  } catch (error: any) {
    console.error('Error updating incident action:', error);
    return res.status(500).json({ success: false, error: 'Failed to update action.' });
  }
};

export const addIncidentNote = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { id } = req.params;
    const { author, message, role } = req.body;

    if (!message || !message.trim()) {
      return res.status(400).json({ success: false, error: 'Message content is required.' });
    }

    const incident = await IncidentService.getIncidentById(id);
    if (!incident) {
      return res.status(404).json({ success: false, error: `Incident '${id}' not found.` });
    }

    if (!isAuthorizedForJurisdiction(req, incident.jurisdictionId)) {
      return res.status(403).json({
        success: false,
        error: `Forbidden: You are not authorized to post notes on another district's incident.`
      });
    }

    const note = await IncidentService.addNote(
      id,
      author || req.user?.name || 'District Operations Officer',
      message.trim(),
      role || 'OPERATIONS',
      req.user?.id
    );

    return res.status(201).json({ success: true, data: note });
  } catch (error: any) {
    console.error('Error adding incident note:', error);
    return res.status(500).json({ success: false, error: 'Failed to add note to incident.' });
  }
};
