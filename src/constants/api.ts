export const APPOINTMENT_STATUS = {
  WAITING: 'WAITING',
  CHECKED_IN: 'CHECKED_IN',
  NO_SHOW: 'NO_SHOW',
} as const;

export const GENDER = {
  MALE: 'MALE',
  FEMALE: 'FEMALE',
  OTHER: 'OTHER',
} as const;

export const VISIT_STATUS = {
  WAITING: 'WAITING',
  IN_PROGRESS: 'IN_PROGRESS',
  COMPLETED: 'COMPLETED',
  CANCELLED: 'CANCELLED',
} as const;
