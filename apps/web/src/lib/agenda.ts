import { api } from './api';

export type AppointmentStatus = 'PENDING' | 'CONFIRMED' | 'CANCELLED' | 'NO_SHOW' | 'COMPLETED';

export interface WorkBreak {
  id: string;
  professionalId: string;
  startTime: string;
  endTime: string;
  label: string | null;
}

export interface TimeBlock {
  id: string;
  professionalId: string;
  date: string;
  startTime: string;
  endTime: string;
  reason: string | null;
}

export interface Service {
  id: string;
  name: string;
  duration: number;
  price: number | null;
  description: string | null;
  active: boolean;
}

export interface WorkSchedule {
  id: string;
  dayOfWeek: number;
  startTime: string;
  endTime: string;
}

export interface Professional {
  id: string;
  name: string;
  specialty: string | null;
  active: boolean;
  schedule: WorkSchedule[];
}

export interface Appointment {
  id: string;
  scheduledAt: string;
  status: AppointmentStatus;
  notes: string | null;
  service: Service;
  professional: Professional;
  contact: { id: string; name: string | null; phoneNumber: string };
}

export interface AvailableSlot {
  time: string;
  professionalId: string;
  professionalName: string;
  dateTime: string;
}

// Services
export const getServices = () => api.get<Service[]>('/agenda/services').then((r) => r.data);
export const createService = (d: Partial<Service>) => api.post<Service>('/agenda/services', d).then((r) => r.data);
export const updateService = (id: string, d: Partial<Service>) => api.patch<Service>(`/agenda/services/${id}`, d).then((r) => r.data);
export const deleteService = (id: string) => api.delete(`/agenda/services/${id}`);

// Professionals
export const getProfessionals = () => api.get<Professional[]>('/agenda/professionals').then((r) => r.data);
export const createProfessional = (d: Partial<Professional>) => api.post<Professional>('/agenda/professionals', d).then((r) => r.data);
export const updateProfessional = (id: string, d: Partial<Professional>) => api.patch<Professional>(`/agenda/professionals/${id}`, d).then((r) => r.data);
export const upsertSchedule = (id: string, schedule: WorkSchedule[]) => api.patch(`/agenda/professionals/${id}/schedule`, { schedule });

// Work Breaks
export const getWorkBreaks = (professionalId: string) =>
  api.get<WorkBreak[]>(`/agenda/professionals/${professionalId}/breaks`).then((r) => r.data);
export const createWorkBreak = (professionalId: string, d: { startTime: string; endTime: string; label?: string }) =>
  api.post<WorkBreak>(`/agenda/professionals/${professionalId}/breaks`, d).then((r) => r.data);
export const deleteWorkBreak = (professionalId: string, breakId: string) =>
  api.delete(`/agenda/professionals/${professionalId}/breaks/${breakId}`);

// Time Blocks
export const getTimeBlocks = (professionalId: string, date?: string) =>
  api.get<TimeBlock[]>(`/agenda/professionals/${professionalId}/blocks`, { params: date ? { date } : {} }).then((r) => r.data);
export const createTimeBlock = (professionalId: string, d: { date: string; startTime: string; endTime: string; reason?: string }) =>
  api.post<TimeBlock>(`/agenda/professionals/${professionalId}/blocks`, d).then((r) => r.data);
export const deleteTimeBlock = (professionalId: string, blockId: string) =>
  api.delete(`/agenda/professionals/${professionalId}/blocks/${blockId}`);

// Slots
export const getAvailableSlots = (date: string, serviceId: string, professionalId?: string) =>
  api.get<AvailableSlot[]>('/agenda/slots', { params: { date, serviceId, professionalId } }).then((r) => r.data);

// Appointments
export const getAppointments = (params?: { date?: string; status?: AppointmentStatus; professionalId?: string }) =>
  api.get<Appointment[]>('/agenda/appointments', { params }).then((r) => r.data);

export const getMonthAppointments = (yearMonth: string) => {
  const [year, month] = yearMonth.split('-').map(Number);
  const startDate = `${yearMonth}-01T00:00:00`;
  const nextMonth = month === 12 ? `${(year ?? 0) + 1}-01` : `${year}-${String((month ?? 0) + 1).padStart(2, '0')}`;
  const endDate = `${nextMonth}-01T00:00:00`;
  return api.get<Appointment[]>('/agenda/appointments', { params: { startDate, endDate } }).then((r) => r.data);
};

export const createAppointment = (d: {
  contactId: string;
  serviceId: string;
  professionalId: string;
  scheduledAt: string;
  notes?: string;
}) => api.post<Appointment>('/agenda/appointments', d).then((r) => r.data);

export const updateAppointmentStatus = (id: string, status: AppointmentStatus) =>
  api.patch<Appointment>(`/agenda/appointments/${id}/status`, { status }).then((r) => r.data);

export const searchContacts = (q: string) =>
  api
    .get<{ items: { id: string; name: string | null; phoneNumber: string }[] }>('/contacts', { params: { search: q, limit: 10 } })
    .then((r) => r.data.items);

export const createContact = (d: { phoneNumber: string; name?: string; email?: string }) =>
  api.post<{ id: string; name: string | null; phoneNumber: string }>('/contacts', d).then((r) => r.data);

export const STATUS_LABEL: Record<AppointmentStatus, string> = {
  PENDING: 'Pendente',
  CONFIRMED: 'Confirmado',
  CANCELLED: 'Cancelado',
  NO_SHOW: 'Faltou',
  COMPLETED: 'Concluído',
};

export const STATUS_COLOR: Record<AppointmentStatus, string> = {
  PENDING: 'text-yellow-400 bg-yellow-400/10 border-yellow-400/20',
  CONFIRMED: 'text-green-400 bg-green-400/10 border-green-400/20',
  CANCELLED: 'text-red-400 bg-red-400/10 border-red-400/20',
  NO_SHOW: 'text-gray-400 bg-gray-400/10 border-gray-400/20',
  COMPLETED: 'text-brand-400 bg-brand-400/10 border-brand-400/20',
};

export const DAY_NAMES = ['Domingo', 'Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado'];
