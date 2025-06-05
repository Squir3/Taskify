import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { ROLES_KEY } from './roles.decorator';
import { AppRole } from '../users/schemas/user.schema';

interface User {
  role: AppRole;
}

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const allowed = this.reflector.getAllAndOverride<AppRole[]>(ROLES_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);
    if (!allowed?.length) return true; // brak adnotacji = publiczne

    const request = context.switchToHttp().getRequest<{ user: User }>();
    const user = request.user; // Rzutowanie na odpowiedni typ
    return allowed.includes(user.role);
  }
}
