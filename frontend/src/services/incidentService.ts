import { apiRequest, isOfflineMode } from './api.js';
import { Incident, ResponseAction, IncidentNote, ResponseTeam } from '../types/index.js';
import { MOCK_INCIDENTS, MOCK_TEAMS } from './mockData.js';

// In-memory mutable copy for offline mode so actions/notes feel interactive
let _mockIncidents = MOCK_INCIDENTS.map((inc) => ({
  ...inc,
  actions: inc.actions.map((a) => ({ ...a })),
  notes: inc.notes.map((n) => ({ ...n })),
}));

export const incidentService = {
  async getIncidents(): Promise<Incident[]> {
    if (await isOfflineMode()) return _mockIncidents;
    const res = await apiRequest<{ success: boolean; data: Incident[] }>('/incidents');
    return res.data;
  },

  async getIncidentById(id: string): Promise<Incident> {
    if (await isOfflineMode()) {
      const inc = _mockIncidents.find((i) => i.id === id);
      if (!inc) throw new Error(`Incident ${id} not found in mock data`);
      return inc;
    }
    const res = await apiRequest<{ success: boolean; data: Incident }>(`/incidents/${id}`);
    return res.data;
  },

  async createIncident(payload: {
    locationId: string;
    title?: string;
    severity?: string;
    riskScore?: number;
    responseTeamId?: string;
    summary?: string;
  }): Promise<Incident> {
    if (await isOfflineMode()) {
      const newInc: Incident = {
        id: `inc-${Date.now()}`,
        incidentNumber: `INC-2024-${String(Math.floor(Math.random() * 9000) + 1000)}`,
        locationId: payload.locationId,
        responseTeamId: payload.responseTeamId ?? null,
        responseTeam: null,
        title: payload.title ?? 'New Incident',
        severity: (payload.severity as any) ?? 'MEDIUM',
        riskScore: payload.riskScore ?? 50,
        status: 'RISK_DETECTED',
        waterLevelAtIncident: 0,
        rainfallAtIncident: 0,
        summary: payload.summary ?? '',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        resolvedAt: null,
        actions: [],
        notes: [],
      };
      _mockIncidents = [newInc, ..._mockIncidents];
      return newInc;
    }
    const res = await apiRequest<{ success: boolean; data: Incident }>('/incidents', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
    return res.data;
  },

  async updateIncidentStatus(id: string, status: string, responseTeamId?: string): Promise<Incident> {
    if (await isOfflineMode()) {
      const inc = _mockIncidents.find((i) => i.id === id);
      if (!inc) throw new Error(`Incident ${id} not found`);
      inc.status = status as any;
      if (responseTeamId) {
        inc.responseTeamId = responseTeamId;
        inc.responseTeam = MOCK_TEAMS.find((t) => t.id === responseTeamId) ?? null;
      }
      inc.updatedAt = new Date().toISOString();
      return inc;
    }
    const res = await apiRequest<{ success: boolean; data: Incident }>(`/incidents/${id}`, {
      method: 'PATCH',
      body: JSON.stringify({ status, responseTeamId }),
    });
    return res.data;
  },

  async toggleAction(actionId: string, isCompleted: boolean): Promise<ResponseAction> {
    if (await isOfflineMode()) {
      for (const inc of _mockIncidents) {
        const action = inc.actions.find((a) => a.id === actionId);
        if (action) {
          action.isCompleted = isCompleted;
          action.completedAt = isCompleted ? new Date().toISOString() : null;
          return action;
        }
      }
      throw new Error(`Action ${actionId} not found in mock data`);
    }
    const res = await apiRequest<{ success: boolean; data: ResponseAction }>(`/incidents/any/actions/${actionId}`, {
      method: 'PATCH',
      body: JSON.stringify({ isCompleted }),
    });
    return res.data;
  },

  async addNote(incidentId: string, message: string, author?: string): Promise<IncidentNote> {
    if (await isOfflineMode()) {
      const inc = _mockIncidents.find((i) => i.id === incidentId);
      if (!inc) throw new Error(`Incident ${incidentId} not found`);
      const note: IncidentNote = {
        id: `note-${Date.now()}`,
        incidentId,
        author: author ?? 'Elena Vance',
        role: 'Lead Operations Officer',
        message,
        createdAt: new Date().toISOString(),
      };
      inc.notes.push(note);
      return note;
    }
    const res = await apiRequest<{ success: boolean; data: IncidentNote }>(`/incidents/${incidentId}/notes`, {
      method: 'POST',
      body: JSON.stringify({ message, author }),
    });
    return res.data;
  },

  async getTeams(): Promise<ResponseTeam[]> {
    if (await isOfflineMode()) return MOCK_TEAMS;
    const res = await apiRequest<{ success: boolean; data: ResponseTeam[] }>('/teams');
    return res.data;
  },
};
