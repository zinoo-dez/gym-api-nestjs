import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PrismaModule } from './prisma/prisma.module';
import { AuthModule } from './auth/auth.module';
import { MembersModule } from './members/members.module';
import { MembershipsModule } from './memberships/memberships.module';

@Module({
  imports: [PrismaModule, AuthModule, MembersModule, MembershipsModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
