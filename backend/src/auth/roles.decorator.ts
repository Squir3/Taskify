import { SetMetadata } from '@nestjs/common';
import { AppRole } from '../users/schemas/user.schema';

export const ROLES_KEY = 'roles';
export const Roles = (...roles: AppRole[]) => SetMetadata(ROLES_KEY, roles);
