import { PartialType } from '@nestjs/swagger';
import { CreateMarketingAutomationDto } from './create-marketing-automation.dto';

export class UpdateMarketingAutomationDto extends PartialType(
  CreateMarketingAutomationDto,
) {}
