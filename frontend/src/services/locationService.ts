import { apiRequest, isOfflineMode } from './api.js';
import { LocationItem } from '../types/index.js';
import { MOCK_LOCATIONS } from './mockData.js';

export const locationService = {
  async getLocations(): Promise<LocationItem[]> {
    const token = localStorage.getItem('climateshield_token');
    // Authenticated users must always fetch tenant-isolated backend data
    if (token) {
      const res = await apiRequest<{ success: boolean; data: LocationItem[] }>('/locations');
      return res.data;
    }
    if (await isOfflineMode()) return MOCK_LOCATIONS;
    const res = await apiRequest<{ success: boolean; data: LocationItem[] }>('/locations');
    return res.data;
  },

  async getLocationById(id: string): Promise<LocationItem> {
    const token = localStorage.getItem('climateshield_token');
    if (token) {
      const res = await apiRequest<{ success: boolean; data: LocationItem }>(`/locations/${id}`);
      return res.data;
    }
    if (await isOfflineMode()) {
      const loc = MOCK_LOCATIONS.find((l) => l.id === id);
      if (!loc) throw new Error(`Location ${id} not found in mock data`);
      return loc;
    }
    const res = await apiRequest<{ success: boolean; data: LocationItem }>(`/locations/${id}`);
    return res.data;
  },
};
