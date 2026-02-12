import { ExtractJwt, Strategy } from 'passport-jwt';
import { PassportStrategy } from '@nestjs/passport';
import { Injectable } from '@nestjs/common';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor() {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: process.env.JWT_SECRET, // Pastikan sama dengan di .env
    });
  }

  // Fungsi ini jalan otomatis jika token valid
  // Hasil return akan masuk ke 'req.user' di Controller
  async validate(payload: any) {
    return {
      userId: payload.sub,
      role: payload.role,
      permissions: payload.permissions, // Penting untuk PermissionsGuard
    };
  }
}
