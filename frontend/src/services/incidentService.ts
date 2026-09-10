import { apiRequest } from './api.js';
import { Incident, ResponseAction, IncidentNote, ResponseTeam } from '../types/index.js';

export const incidentService = {
  async getIncidents(): Promise<Incident[]> {
    const res = await apiRequest<{ success: boolean; data: Incident[] }>('/incidents');
    return res.data;
  },

  async getIncidentById(id: string): Promise<Incident> {
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
    const res = await apiRequest<{ success: boolean; data: Incident }>('/incidents', {
      method: 'POST',
      body: JSON.stringify(payload)
    });
    return res.data;
  },

  async updateIncidentStatus(id: string, status: string, responseTeamId?: string): Promise<Incident> {
    const res = await apiRequest<{ success: boolean; data: Incident }>(`/incidents/${id}`, {
      method: 'PATCH',
      body: JSON.stringify({ status, responseTeamId })
    });
    return res.data;
  },

  async toggleAction(actionId: string, isCompleted: boolean): Promise<ResponseAction> {
    const res = await apiRequest<{ success: boolean; data: ResponseAction }>(`/incidents/any/actions/${actionId}`, {
      method: 'PATCH',
      body: JSON.stringify({ isCompleted })
    });
    return res.data;
  },

  async addNote(incidentId: string, message: string, author?: string): Promise<IncidentNote> {
    const res = await apiRequest<{ success: boolean; data: IncidentNote }>(`/incidents/${incidentId}/notes`, {
      method: 'POST',
      body: JSON.stringify({ message, author })
    });
    return res.data;
  },

  async getTeams(): Promise<ResponseTeam[]> {
    const res = await apiRequest<{ success: boolean; data: ResponseTeam[] }>('/teams');
    return res.data;
  }
};
