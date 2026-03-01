import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { UsersService } from '../users/users.service';
import { JwtService } from '@nestjs/jwt';
import { LoginDto } from './dto/login-user.dto';
import * as argon2 from 'argon2';
import { ConfigService } from '@nestjs/config';
import { RegisterDto } from './dto/register-user.dto';

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
    private config: ConfigService,
  ) {}

  private normalizeEmail(email: string) {
    return email.trim().toLowerCase();
  }

  private async registerTokens(user: {
    id: string;
    email: string;
    role: string;
    fullName: string;
  }) {
    const accessSecret = this.config.getOrThrow<string>('JWT_ACCESS_SECRET');
    const refreshSecret = this.config.getOrThrow<string>('JWT_REFRESH_SECRET');

    const accessExp = parseInt(
      this.config.get<string>('JWT_ACCESS_EXPIRATION') ?? '900',
      10,
    );

    const refreshExp = parseInt(
      this.config.get<string>('JWT_REFRESH_EXPIRATION') ?? '604800',
      10,
    );

    const payload = {
      sub: user.id,
      email: user.email,
      fullName: user.fullName,
      role: user.role,
    };

    const [access_token, refresh_token] = await Promise.all([
      this.jwtService.signAsync(payload, {
        secret: accessSecret,
        expiresIn: accessExp,
      }),
      this.jwtService.signAsync(payload, {
        secret: refreshSecret,
        expiresIn: refreshExp,
      }),
    ]);

    return { access_token, refresh_token };
  }

  private async storeRefreshHash(userId: string, refreshToken: string) {
    const hash = await argon2.hash(refreshToken);
    await this.usersService.setRefreshTokenHash(userId, hash);
  }

  // ================= REGISTER =================
  async register(dto: RegisterDto) {
    const email = this.normalizeEmail(dto.email);

    const userExists = await this.usersService.findByEmail(email);
    if (userExists) {
      throw new BadRequestException('Email นี้ถูกใช้งานแล้ว');
    }

    const password = await argon2.hash(dto.password);

    const newUser = await this.usersService.create({
      fullName: dto.fullName,
      phone: dto.phone,
      email,
      password,
      role: 'user',
    });

    const tokens = await this.registerTokens({
      id: String(newUser._id),
      email: newUser.email,
      fullName: newUser.fullName,   // ✅ แก้แล้ว
      role: newUser.role,
    });

    await this.storeRefreshHash(String(newUser._id), tokens.refresh_token);

    return tokens;
  }

  // ================= LOGIN =================
  async login(dto: LoginDto) {
    const email = this.normalizeEmail(dto.email);

    const user = await this.usersService.findByEmailWithSecrets(email);
    if (!user) {
      throw new UnauthorizedException('อีเมลหรือรหัสผ่านไม่ถูกต้อง');
    }

    const passwordMatches = await argon2.verify(user.password, dto.password);

    if (!passwordMatches) {
      throw new UnauthorizedException('อีเมลหรือรหัสผ่านไม่ถูกต้อง');
    }

    const tokens = await this.registerTokens({
      id: String(user._id),
      email: user.email,
      fullName: user.fullName,   // ✅ ใช้ user ไม่ใช่ newUser
      role: user.role,
    });

    await this.storeRefreshHash(String(user._id), tokens.refresh_token);

    return tokens;
  }

  // ================= REFRESH =================
  async refreshTokens(
    userId: string,
    refreshToken: string,
  ) {
    if (!refreshToken) {
      throw new ForbiddenException('Access denied');
    }

    const user = await this.usersService.findByIdWithRefresh(userId);
    if (!user?.refreshTokenHash) {
      throw new ForbiddenException('Access denied');
    }

    const matches = await argon2.verify(user.refreshTokenHash, refreshToken);

    if (!matches) {
      throw new ForbiddenException('Access denied');
    }

    const tokens = await this.registerTokens({
      id: String(user._id),
      email: user.email,
      fullName: user.fullName,  // ✅ ดึงจาก DB
      role: user.role,
    });

    await this.storeRefreshHash(userId, tokens.refresh_token);

    return tokens;
  }

  // ================= LOGOUT =================
  async logout(userId: string) {
    await this.usersService.setRefreshTokenHash(userId, null);
    return { success: true };
  }
}