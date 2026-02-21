export class InstructorProfileResponseDto {
  trainerId!: string;
  fullName!: string;
  bio?: string;
  specializations!: string[];
  experience!: number;
  certifications?: string;
  averageRating!: number;
  ratingsCount!: number;
  classHistory!: {
    pastClassesCount: number;
    upcomingClassesCount: number;
    topClassTypes: string[];
  };
}
