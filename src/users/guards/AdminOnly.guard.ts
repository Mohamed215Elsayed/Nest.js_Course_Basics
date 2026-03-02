import { UseGuards, applyDecorators } from "@nestjs/common";
import { AuthGuard } from "./auth.guard";
import { RolesGuard } from "./roles.guard";
import { UserRole } from "../../utils/enums/user-role.enum";
import { Roles } from "../decorators/roles.decorator";

export const AdminOnly = () =>
    applyDecorators(
      UseGuards(AuthGuard, RolesGuard),
      Roles(UserRole.ADMIN),
    );
  