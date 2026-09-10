import { Request, Response } from 'express';
import { IncidentService } from '../services/incidents/incidentService.js';
import { prisma } from '../config/db.js';

export const getIncidents = async (_req: Request, res: Response) => {
  try {
    const incidents = await IncidentService.getAllIncidents();
    return res.json({ success: true, count: incidents.length, data: incidents });
  } catch (error: any) {
    console.error('Error fetching incidents:', error);
    return res.status(500).json({ error: 'Failed to retrieve incidents.' });
  }
};

export const getIncidentById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const incident = await IncidentService.getIncidentById(id);

    if (!incident) {
      return res.status(404).json({ error: `Incident '${id}' not found.` });
    }

    return res.json({ success: true, data: incident });
  } catch (error: any) {
    console.error('Error fetching incident:', error);
    return res.status(500).json({ error: 'Failed to retrieve incident.' });
  }
};

export const createIncident = async (req: Request, res: Response) => {
  try {
    const { locationId, title, severity, riskScore, responseTeamId, summary } = req.body;

    if (!locationId) {
      return res.status(400).json({ error: 'locationId is required to declare an incident.' });
    }

    const newIncident = await IncidentService.createIncident({
      locationId,
      title,
      severity,
      riskScore: riskScore ? Number(riskScore) : undefined,
      responseTeamId,
      summary
    });

    return res.status(201).json({ success: true, data: newIncident });
  } catch (error: any) {
    console.error('Error creating incident:', error);
    return res.status(500).json({ error: error.message || 'Failed to create incident.' });
  }
};

export const updateIncident = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { status, responseTeamId, severity } = req.body;

    const updated = await IncidentService.updateIncident(id, {
      status,
      responseTeamId,
      severity
    });

    return res.json({ success: true, data: updated });
  } catch (error: any) {
    console.error('Error updating incident:', error);
    return res.status(500).json({ error: 'Failed to update incident.' });
  }
};

export const getIncidentActions = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const incident = await IncidentService.getIncidentById(id);

    if (!incident) {
      return res.status(404).json({ error: `Incident '${id}' not found.` });
    }

    return res.json({ success: true, data: incident.actions });
  } catch (error: any) {
    console.error('Error getting incident actions:', error);
    return res.status(500).json({ error: 'Failed to retrieve actions.' });
  }
};

export const updateIncidentAction = async (req: Request, res: Response) => {
  try {
    const { actionId } = req.params;
    const { isCompleted } = req.body;

    if (isCompleted === undefined) {
      return res.status(400).json({ error: 'isCompleted (boolean) is required.' });
    }

    const updatedAction = await IncidentService.toggleAction(actionId, Boolean(isCompleted));
    return res.json({ success: true, data: updatedAction });
  } catch (error: any) {
    console.error('Error updating incident action:', error);
    return res.status(500).json({ error: 'Failed to update action.' });
  }
};

export const addIncidentNote = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { author, message, role } = req.body;

    if (!message || !message.trim()) {
      return res.status(400).json({ error: 'Message content is required.' });
    }

    const note = await IncidentService.addNote(
      id,
      author || 'Elena Vance (Lead Officer)',
      message.trim(),
      role || 'OPERATIONS'
    );

    return res.status(201).json({ success: true, data: note });
  } catch (error: any) {
    console.error('Error adding incident note:', error);
    return res.status(500).json({ error: 'Failed to add note to incident.' });
  }
};
