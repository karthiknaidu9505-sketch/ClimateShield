import { apiRequest } from './api.js';
import { LocationItem } from '../types/index.js';

export const locationService = {
  async getLocations(): Promise<LocationItem[]> {
    const res = await apiRequest<{ success: boolean; data: LocationItem[] }>('/locations');
    return res.data;
  },

  async getLocationById(id: string): Promise<LocationItem> {
    const res = await apiRequest<{ success: boolean; data: LocationItem }>(`/locations/${id}`);
    return res.data;
  }
};
