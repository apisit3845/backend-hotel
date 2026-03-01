import {
  IsBoolean,
  IsEmail,
  IsNotEmpty,
  IsString,
  MinLength,
  Matches,
  IsPhoneNumber,
} from 'class-validator';

export class RegisterDto {
  @IsString({ message: 'กรุณากรอกชื่อ-นามสกุล' })
  @IsNotEmpty({ message: 'กรุณากรอกชื่อ-นามสกุล' })
  fullName: string;

  @IsEmail({}, { message: 'รูปแบบอีเมลไม่ถูกต้อง' })
  @IsNotEmpty({ message: 'กรุณากรอกอีเมล' })
  email: string;

  @IsString({ message: 'กรุณากรอกเบอร์โทรศัพท์' })
  @Matches(/^[0-9]{9,10}$/, {
    message: 'เบอร์โทรต้องเป็นตัวเลข 9-10 หลัก',
  })
  phone: string;

  @IsString()
  @MinLength(8, { message: 'รหัสผ่านต้องมีความยาวอย่างน้อย 8 ตัว' })
  @Matches(/^(?=.*[A-Za-z])(?=.*\d).+$/, {
    message: 'รหัสผ่านต้องมีทั้งตัวอักษรและตัวเลข',
  })
  password: string;

  @IsBoolean({ message: 'กรุณายอมรับเงื่อนไขการใช้งาน' })
  agree: boolean;

}
