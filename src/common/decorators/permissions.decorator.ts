import { SetMetadata } from '@nestjs/common';

export const PERMISSION_KEY = 'permissions';
export const RequirePermissions = (...args: string[]) =>
  SetMetadata(PERMISSION_KEY, args);
