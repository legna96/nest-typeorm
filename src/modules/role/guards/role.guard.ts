import { CanActivate, ExecutionContext, Injectable, ForbiddenException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';

@Injectable()
export class RoleGuard implements CanActivate {
  constructor(private readonly _reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const roles: string[] = this._reflector.get<string[]>(
      'roles',
      context.getHandler(),
    );

    if (!roles) {
      return true;
    }

    const request = context.switchToHttp().getRequest();
    const { user } = request;

    const hasRole = () =>
      user.roles.some((role: string) => roles.includes(role));

    const permitido = user && user.roles && hasRole();

    if (!permitido) {
      throw new ForbiddenException('your role not has permised')
    }

    return permitido;
  }
}
