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

  // 1. Ambil Semua Role
  async findAll() {
    return this.prisma.role.findMany({
      include: {
        permissions: true, // Sertakan data permission
        _count: { select: { users: true } }, // Hitung jumlah user di role ini
      },
    });
  }

  // 2. Ambil Detail Role
  async findOne(id: number) {
    const role = await this.prisma.role.findUnique({
      where: { id },
      include: { permissions: true },
    });
    if (!role) throw new NotFoundException('Role tidak ditemukan');
    return role;
  }

  // 3. Buat Role Baru & Assign Permission
  async create(dto: CreateRoleDto) {
    // Cek nama kembar
    const existing = await this.prisma.role.findUnique({
      where: { name: dto.name },
    });
    if (existing) throw new BadRequestException('Nama role sudah digunakan');

    return this.prisma.role.create({
      data: {
        name: dto.name,
        permissions: {
          connect: dto.permissionIds.map((id) => ({ id })), // Hubungkan permission berdasarkan ID
        },
      },
      include: { permissions: true },
    });
  }

  // 4. Update Role & Permission
  async update(id: number, dto: UpdateRoleDto) {
    // Cek role ada atau tidak
    await this.findOne(id);

    return this.prisma.role.update({
      where: { id },
      data: {
        name: dto.name,
        permissions: dto.permissionIds
          ? { set: dto.permissionIds.map((id) => ({ id })) } // 'set' akan mengganti seluruh permission lama dengan yang baru
          : undefined,
      },
      include: { permissions: true },
    });
  }

  // 5. Hapus Role
  async remove(id: number) {
    // Cek apakah ada user yang masih pakai role ini
    const userCount = await this.prisma.user.count({ where: { roleId: id } });
    if (userCount > 0) {
      throw new BadRequestException(
        'Gagal hapus. Masih ada User yang menggunakan Role ini.',
      );
    }

    return this.prisma.role.delete({ where: { id } });
  }

  // 6. List Semua Permission (Untuk UI dropdown saat bikin role)
  async findAllPermissions() {
    return this.prisma.permission.findMany();
  }
}
