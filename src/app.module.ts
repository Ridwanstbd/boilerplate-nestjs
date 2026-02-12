import { Module } from '@nestjs/common';
import { AuthService } from './modules/auth/auth.service';
import { UsersService } from './modules/users/users.service';
import { PrismaService } from './prisma/prisma.service';
import { PrismaModule } from './prisma/prisma.module';
import { MailService } from './modules/mail/mail.service';
import { AuthController } from './modules/auth/auth.controller';
import { AuthModule } from './modules/auth/auth.module';
import { RolesService } from './modules/roles/roles.service';
import { JwtStrategy } from './modules/auth/jwt.strategy';
import { RolesController } from './modules/roles/roles.controller';
import { UsersController } from './modules/users/users.controller';

@Module({
  imports: [PrismaModule, AuthModule],
  controllers: [AuthController, RolesController, UsersController],
  providers: [
    AuthService,
    UsersService,
    PrismaService,
    MailService,
    RolesService,
  ],
})
export class AppModule {}
