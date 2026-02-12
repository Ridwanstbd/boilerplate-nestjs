import {
  Injectable,
  BadRequestException,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateRoleDto, UpdateRoleDto } from './dto/role.dto';

@Injectable()
export class RolesService {
  constructor(private prisma: PrismaService) {}

  async findAll() {
    return this.prisma.role.findMany({
      include: {
        permissions: true,
        _count: { select: { users: true } },
      },
    });
  }

  async findOne(id: number) {
    const role = await this.prisma.role.findUnique({
      where: { id },
      include: { permissions: true },
    });
    if (!role) throw new NotFoundException('Role tidak ditemukan');
    return role;
  }

  async create(dto: CreateRoleDto) {
    const existing = await this.prisma.role.findUnique({
      where: { name: dto.name },
    });
    if (existing) throw new BadRequestException('Nama role sudah digunakan');

    return this.prisma.role.create({
      data: {
        name: dto.name,
        permissions: {
          connect: dto.permissionIds.map((id) => ({ id })),
        },
      },
      include: { permissions: true },
    });
  }

  async update(id: number, dto: UpdateRoleDto) {
    await this.findOne(id);

    return this.prisma.role.update({
      where: { id },
      data: {
        name: dto.name,
        permissions: dto.permissionIds
          ? { set: dto.permissionIds.map((id) => ({ id })) }
          : undefined,
      },
      include: { permissions: true },
    });
  }

  async togglePermission(roleId: number, permissionId: number) {
    const role = await this.findOne(roleId);
    const hasPermission = role.permissions.some((p) => p.id === permissionId);

    return this.prisma.role.update({
      where: { id: roleId },
      data: {
        permissions: hasPermission
          ? { disconnect: { id: permissionId } }
          : { connect: { id: permissionId } },
      },
      include: { permissions: true },
    });
  }

  async remove(id: number) {
    const userCount = await this.prisma.user.count({ where: { roleId: id } });
    if (userCount > 0) {
      throw new BadRequestException(
        'Gagal hapus. Masih ada User yang menggunakan Role ini.',
      );
    }

    return this.prisma.role.delete({ where: { id } });
  }

  async findAllPermissions() {
    return this.prisma.permission.findMany();
  }
}
