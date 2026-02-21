export class MemberClassCreditsResponseDto {
  memberId!: string;
  totalRemainingCredits!: number;
  hasUnlimitedPass!: boolean;
  activePasses!: Array<{
    passId: string;
    packageName: string;
    expiresAt: Date;
    remainingCredits: number;
    monthlyUnlimited: boolean;
  }>;
}
