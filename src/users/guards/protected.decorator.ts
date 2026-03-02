import { applyDecorators, UseGuards } from '@nestjs/common';
import { AuthGuard } from '../../users/guards/auth.guard';
import { RolesGuard } from './roles.guard';
import { Roles } from '../decorators/roles.decorator';
import { UserRole } from '../../utils/enums/user-role.enum';

export function Protected(...roles: UserRole[]) {
  return applyDecorators(
    UseGuards(AuthGuard, RolesGuard),
    Roles(...roles),
  );
}
