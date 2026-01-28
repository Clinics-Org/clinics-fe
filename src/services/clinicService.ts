// Clinic service - Fetches clinic data from API

import { apiClient } from './apiClient';
import type { Clinic } from '../types';

// Hardcoded clinic ID as per requirements
const CLINIC_ID = '92c7233d-212c-4a5a-85f3-02994d99eee4';

export const clinicService = {
  /**
   * Get clinic ID (hardcoded for now)
   */
  getClinicId(): string {
    return CLINIC_ID;
  },

  /**
   * Get clinic by ID
   * GET /api/clinics/{id}
   */
  async getById(id?: string): Promise<Clinic | null> {
    try {
      const clinicId = id || CLINIC_ID;
      const response = await apiClient.get<Clinic>(`/clinics/${clinicId}`);

      if (!response.success || !response.data) {
        console.error('Failed to fetch clinic:', response.error?.message);
        return null;
      }

      return response.data;
    } catch (error) {
      console.error('Error fetching clinic:', error);
      return null;
    }
  },

  /**
   * Get current clinic (uses hardcoded ID)
   */
  async getCurrentClinic(): Promise<Clinic | null> {
    return this.getById(CLINIC_ID);
  },
};
