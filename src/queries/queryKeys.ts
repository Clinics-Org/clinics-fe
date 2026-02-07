export const queryKeys = {
  auth: ['auth'] as const,
  patients: ['patients'] as const,
  patient: (id: string) => ['patients', id] as const,
  patientSearch: (query: string) => ['patients', 'search', query] as const,
  visits: ['visits'] as const,
  visitsByPatient: (patientId: string) =>
    ['visits', 'patient', patientId] as const,
  visit: (id: string) => ['visits', id] as const,
  clinics: ['clinics'] as const,
  clinic: ['clinics', 'current'] as const,
  appointments: ['appointments'] as const,
  medications: (query: string) => ['medications', query] as const,
  prescriptions: (id: string) => ['prescriptions', id] as const,
};
