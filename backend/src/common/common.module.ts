import { Global, Module } from '@nestjs/common';
import { AuthorizationService } from './services/authorization.service';
import { UserCreationService } from './services/user-creation.service';

/**
 * Global module providing shared services used across multiple feature modules.
 * Since this is @Global(), consumers don't need to import it explicitly.
 */
@Global()
@Module({
    providers: [AuthorizationService, UserCreationService],
    exports: [AuthorizationService, UserCreationService],
})
export class CommonModule { }
