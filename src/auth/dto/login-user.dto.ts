import { IsEmail, IsNotEmpty, IsString, MinLength } from 'class-validator';

export class LoginDto {
  @IsEmail({},{ message: 'รูปแบบอีเมลไม่ถูกต้อง' })
  @IsNotEmpty()
  email: string; 

  @IsString()
  @IsNotEmpty()
  @MinLength(8, { message: 'รหัสผ่านต้องมีอย่างน้อย 8 ตัวอักษร' })
  password: string;

}

