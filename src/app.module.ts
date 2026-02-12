import { Module } from '@nestjs/common';
import { AuthService } from './modules/auth/auth.service';
import { UsersService } from './modules/users/users.service';
import { PrismaService } from './prisma/prisma.service';
import { PrismaModule } from './prisma/prisma.module';
import { MailService } from './modules/mail/mail.service';
import { AuthController } from './modules/auth/auth.controller';
import { AuthModule } from './modules/auth/auth.module';
import { RolesService } from './modules/roles/roles.service';
import { RolesController } from './modules/roles/roles.controller';
import { UsersController } from './modules/users/users.controller';
import { ConfigModule } from '@nestjs/config';
import * as Joi from 'joi';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      validationSchema: Joi.object({
        NODE_ENV: Joi.string()
          .valid('development', 'production', 'test')
          .default('development'),
        PORT: Joi.number().default(3000),

        DATABASE_URL: Joi.string().required().messages({
          'any.required': 'DATABASE_URL is required for Prisma connection',
        }),

        JWT_SECRET: Joi.string().required().messages({
          'any.required': 'JWT_SECRET is required to sign tokens',
        }),
        JWT_EXPIRATION: Joi.string().default('1d'),

        MAIL_HOST: Joi.string().required(),
        MAIL_PORT: Joi.number().default(587),
        MAIL_USER: Joi.string().required(),
        MAIL_PASSWORD: Joi.string().required(),
        MAIL_FROM: Joi.string().email().required(),

        FRONTEND_URL: Joi.string().uri().required().messages({
          'any.required':
            'FRONTEND_URL is required for email redirection links',
          'string.uri': 'FRONTEND_URL must be a valid URL',
        }),
      }),
      validationOptions: {
        allowUnknown: true,
        abortEarly: true,
      },
    }),
    PrismaModule,
    AuthModule,
  ],
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
