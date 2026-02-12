import {
  Injectable,
  UnauthorizedException,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from 'src/prisma/prisma.service';
import { MailService } from '../mail/mail.service';
import * as bcrypt from 'bcrypt';
import * as crypto from 'crypto'; // Bawaan Node.js untuk generate token random
import { RegisterDto, LoginDto, ResetPasswordDto } from './dto/auth.dto';

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwt: JwtService,
    private mail: MailService,
  ) {}

  // 1. REGISTER
  async register(dto: RegisterDto) {
    const hashedPassword = await bcrypt.hash(dto.password, 10);

    // Pastikan Role ID valid sebelum create
    const roleExists = await this.prisma.role.findUnique({
      where: { id: dto.roleId },
    });
    if (!roleExists) throw new BadRequestException('Role tidak ditemukan');

    const user = await this.prisma.user.create({
      data: {
        email: dto.email,
        password: hashedPassword,
        roleId: dto.roleId,
      },
    });

    return { message: 'Registrasi berhasil', userId: user.id };
  }

  // 2. LOGIN (Support Remember Me)
  async login(dto: LoginDto) {
    const user = await this.prisma.user.findUnique({
      where: { email: dto.email },
      include: { role: { include: { permissions: true } } },
    });

    if (!user || !(await bcrypt.compare(dto.password, user.password))) {
      throw new UnauthorizedException('Email atau password salah');
    }

    const payload = {
      sub: user.id,
      role: user.role.name,
      permissions: user.role.permissions.map((p) => p.action),
    };

    // Jika Remember Me = true, token berlaku 7 hari. Jika tidak, 1 hari.
    const expiresIn = dto.rememberMe ? '7d' : '1d';

    return {
      access_token: this.jwt.sign(payload, { expiresIn }),
    };
  }

  // 3. FORGOT PASSWORD
  async forgotPassword(email: string) {
    const user = await this.prisma.user.findUnique({ where: { email } });
    if (!user) throw new NotFoundException('Email tidak terdaftar');

    // Generate token random
    const resetToken = crypto.randomBytes(32).toString('hex');
    // Set expiry 1 jam dari sekarang
    const resetTokenExpiry = new Date(Date.now() + 3600000);

    await this.prisma.user.update({
      where: { email },
      data: { resetToken, resetTokenExpiry },
    });

    await this.mail.sendResetPasswordEmail(user.email, resetToken);

    return { message: 'Email reset password telah dikirim' };
  }

  // 4. RESET PASSWORD
  async resetPassword(dto: ResetPasswordDto) {
    // Cari user berdasarkan token dan pastikan token belum expired
    const user = await this.prisma.user.findFirst({
      where: {
        resetToken: dto.token,
        resetTokenExpiry: { gt: new Date() }, // Expiry harus lebih besar dari sekarang
      },
    });

    if (!user)
      throw new BadRequestException('Token tidak valid atau sudah kadaluarsa');

    const hashedPassword = await bcrypt.hash(dto.newPassword, 10);

    await this.prisma.user.update({
      where: { id: user.id },
      data: {
        password: hashedPassword,
        resetToken: null, // Hapus token setelah dipakai
        resetTokenExpiry: null,
      },
    });

    return { message: 'Password berhasil diubah. Silakan login kembali.' };
  }
}
