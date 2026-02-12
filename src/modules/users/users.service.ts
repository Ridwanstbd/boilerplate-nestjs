import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import * as bcrypt from 'bcrypt';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';

@Injectable()
export class UsersService {
  constructor(private prisma: PrismaService) {}

  async create(dto: CreateUserDto) {
    const existingUser = await this.prisma.user.findUnique({
      where: { email: dto.email },
    });
    if (existingUser) throw new BadRequestException('Email sudah digunakan');

    const hashedPassword = await bcrypt.hash(dto.password, 10);

    // Hapus password dari hasil return
    const { password, ...user } = await this.prisma.user.create({
      data: {
        email: dto.email,
        password: hashedPassword,
        roleId: dto.roleId,
      },
    });

    return user;
  }

  async findAll() {
    return this.prisma.user.findMany({
      select: {
        id: true,
        email: true,
        role: { select: { id: true, name: true } },
        createdAt: true,
      },
    });
  }

  async findOne(id: number) {
    const user = await this.prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        email: true,
        role: { select: { id: true, name: true } },
        createdAt: true,
      },
    });

    if (!user) throw new NotFoundException('User tidak ditemukan');
    return user;
  }

  async update(id: number, dto: UpdateUserDto) {
    const data: any = { ...dto };

    if (dto.password) {
      data.password = await bcrypt.hash(dto.password, 10);
    }

    try {
      const { password, ...updatedUser } = await this.prisma.user.update({
        where: { id },
        data,
      });
      return updatedUser;
    } catch (error) {
      throw new NotFoundException('User tidak ditemukan atau gagal update');
    }
  }

  async remove(id: number) {
    try {
      await this.prisma.user.delete({ where: { id } });
      return { message: 'User berhasil dihapus' };
    } catch (error) {
      throw new NotFoundException('User tidak ditemukan');
    }
  }
}
