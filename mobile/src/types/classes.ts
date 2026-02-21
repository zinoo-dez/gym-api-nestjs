export interface ClassSchedule {
  id: string;
  name: string;
  description?: string;
  trainerId: string;
  trainerName?: string;
  schedule: string;
  duration: number;
  capacity: number;
  availableSlots?: number;
  classType: string;
}

export interface ClassesPage {
  data: ClassSchedule[];
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export interface ClassBooking {
  id: string;
  memberId: string;
  classScheduleId: string;
  status: string;
  createdAt: string;
  updatedAt: string;
}
