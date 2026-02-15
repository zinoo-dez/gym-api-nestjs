import { PartialType } from '@nestjs/swagger';
import { CreateMarketingTemplateDto } from './create-marketing-template.dto';

export class UpdateMarketingTemplateDto extends PartialType(
  CreateMarketingTemplateDto,
) {}
