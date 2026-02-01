export interface Patient {
  id: string;
  name: string;
  mobile: string;
  age?: number;
  gender?: 'M' | 'F';
  createdAt: string;
}

export interface FollowUp {
  value: number;
  unit: 'days' | 'weeks' | 'months';
}

export interface Medicine {
  id: string;
  name: string;
  dosage: string;
  duration: string;
  notes?: string;
}

export interface Prescription {
  medicines: Medicine[];
  followUp?: FollowUp;
  notes?: string;
}

export interface Visit {
  id: string;
  patientId: string;
  date: string;
  notes?: string;
  prescription?: Prescription;
  followUp?: FollowUp;
  status: 'waiting' | 'in_progress' | 'completed';
  // New API fields
  patient?: Patient;
  clinic_id?: string;
  doctor_id?: string;
  visit_reason?: string;
  visit_status?: 'WAITING' | 'IN_PROGRESS' | 'COMPLETED';
  visit_date?: string;
  created_at?: string;
  updated_at?: string;
  prescription_id?: string | null; // ID of the prescription if it exists
  token_number?: number;
}

export interface ClinicDoctor {
  id: string;
  name: string;
  mobile_number?: string;
  email?: string;
  role?: string;
}

export interface Clinic {
  id: string;
  name: string;
  address?: string;
  phone?: string;
  email?: string;
  createdAt?: string;
  updatedAt?: string;
  doctors?: ClinicDoctor[];
}

export interface Appointment {
  id: string;
  name: string;
  mobile_number: string;
  gender: 'MALE' | 'FEMALE';
  doctor?: ClinicDoctor;
  clinic_id: string;
  appointment_date_time: string;
  appointment_status: 'WAITING' | 'CHECKED_IN' | 'NO_SHOW';
  source: string; // e.g., "PHONE", "ONLINE"
  created_at?: string;
  updated_at?: string;
}
