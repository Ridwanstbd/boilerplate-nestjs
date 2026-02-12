import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  ParseIntPipe,
} from '@nestjs/common';
import { RolesService } from './roles.service';
import { CreateRoleDto, UpdateRoleDto } from './dto/role.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { PermissionsGuard } from 'src/common/guards/permissions.guard';
import { RequirePermissions } from 'src/common/decorators/permissions.decorator';
import { TogglePermissionDto } from './dto/role.dto';

@Controller('roles')
@UseGuards(JwtAuthGuard, PermissionsGuard) // Pasang Guard Utama
export class RolesController {
  constructor(private readonly rolesService: RolesService) {}

  @Get()
  @RequirePermissions('read_role')
  findAll() {
    return this.rolesService.findAll();
  }

  @Get('permissions') // Endpoint bantu untuk list permission di Frontend
  @RequirePermissions('read_role')
  listPermissions() {
    return this.rolesService.findAllPermissions();
  }

  @Get(':id')
  @RequirePermissions('read_role')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.rolesService.findOne(id);
  }

  @Post()
  @RequirePermissions('create_role')
  create(@Body() dto: CreateRoleDto) {
    return this.rolesService.create(dto);
  }

  @Patch(':id')
  @RequirePermissions('update_role')
  update(@Param('id', ParseIntPipe) id: number, @Body() dto: UpdateRoleDto) {
    return this.rolesService.update(id, dto);
  }

  @Post(':id/toggle-permission')
  @RequirePermissions('update_role')
  togglePermission(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: TogglePermissionDto,
  ) {
    return this.rolesService.togglePermission(id, dto.permissionId);
  }

  @Delete(':id')
  @RequirePermissions('delete_role')
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.rolesService.remove(id);
  }
}
