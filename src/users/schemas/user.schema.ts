import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

export type UserDocument = HydratedDocument<User>;

export type UserRole = 'user' | 'admin';

@Schema({
  timestamps: true,
  versionKey: false, // ❗ ปิด __v
})
export class User {
  @Prop({
    required: true,
    trim: true,
  })
  fullName: string;

  @Prop({
    required: true,
    unique: true,
    lowercase: true,
    trim: true,
    index: true, // ❗ เพิ่ม index ให้ชัดเจน
  })
  email: string;

  @Prop({
    required: true,
    trim: true,
  })
  phone: string;

  // ✅ เก็บ hash เท่านั้น และไม่ select ออกมาตามปกติ
  @Prop({
    required: true,
    select: false,
  })
  password: string;

  // ✅ จำกัด role ด้วย enum กันค่าหลุด
  @Prop({
    type: String,
    enum: ['user', 'admin'],
    default: 'user',
  })
  role: UserRole;

  // ✅ เก็บ hash ของ refresh token เท่านั้น
  @Prop({
    type: String,
    select: false,
    default: null,
  })
  refreshTokenHash?: string | null;
}

export const UserSchema = SchemaFactory.createForClass(User);

// ✅ ป้องกัน MongoDB ส่ง password/refreshTokenHash ออกไปตอน toJSON
UserSchema.set('toJSON', {
  transform: (_doc: any, ret: any) => {
    delete ret.password;
    delete ret.refreshTokenHash;
    return ret;
  },
});