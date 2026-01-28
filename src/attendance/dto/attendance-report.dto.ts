export class AttendanceReportDto {
  memberId!: string;
  memberName!: string;
  startDate!: Date;
  endDate!: Date;
  totalGymVisits!: number;
  totalClassAttendances!: number;
  totalVisits!: number;
  averageVisitsPerWeek!: number;
  peakVisitHours!: {
    hour: number;
    count: number;
  }[];
  visitsByDayOfWeek!: {
    dayOfWeek: string;
    count: number;
  }[];
}
