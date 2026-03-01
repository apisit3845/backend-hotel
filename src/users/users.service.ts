import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import * as argon2 from 'argon2';

import { User, UserDocument, UserRole } from './schemas/user.schema';
import { RegisterDto } from '../auth/dto/register-user.dto';

@Injectable()
export class UsersService {
  constructor(
    @InjectModel(User.name) private userModel: Model<UserDocument>,
  ) {}

  // ===============================
  // Utils
  // ===============================

  private normalizeEmail(email: string) {
    return email.toLowerCase().trim();
  }

  // ===============================
  // Find Methods
  // ===============================

  async findByEmail(email: string) {
    return this.userModel
      .findOne({ email: this.normalizeEmail(email) })
      .exec();
  }

  // ใช้ตอน login (ดึง password + refreshTokenHash)
  async findByEmailWithSecrets(email: string) {
    return this.userModel
      .findOne({ email: this.normalizeEmail(email) })
      .select('+password +refreshTokenHash')
      .exec();
  }

  async findByIdWithRefresh(userId: string) {
    return this.userModel
      .findById(userId)
      .select('+refreshTokenHash')
      .exec();
  }

  // ===============================
  // Create
  // ===============================

  async createFromRegister(dto: RegisterDto) {
    if (!dto.agree) {
      throw new BadRequestException('กรุณายอมรับเงื่อนไขการใช้งาน');
    }

    const email = this.normalizeEmail(dto.email);

    const exists = await this.findByEmail(email);
    if (exists) {
      throw new BadRequestException('อีเมลนี้ถูกใช้งานแล้ว');
    }

    const hashedPassword = await argon2.hash(dto.password);

    const created = await this.userModel.create({
      fullName: dto.fullName.trim(),
      email,
      phone: dto.phone.trim(),
      password: hashedPassword,
      role: 'user',
    });

    return created.toJSON(); // ใช้ toJSON ที่เราตั้ง transform ไว้
  }

  async create(data: {
    fullName: string;
    phone: string;
    email: string;
    password: string;
    role?: UserRole;
  }) {
    const created = await this.userModel.create({
      fullName: data.fullName.trim(),
      phone: data.phone.trim(),
      email: this.normalizeEmail(data.email),
      password: data.password,
      role: data.role ?? 'user',
    });

    return created;
  }

  // ===============================
  // Refresh Token
  // ===============================

  async setRefreshTokenHash(
    userId: string,
    refreshTokenHash: string | null,
  ) {
    await this.userModel.updateOne(
      { _id: userId },
      { refreshTokenHash },
    );

    return true;
  }
}