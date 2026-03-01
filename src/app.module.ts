import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';

import { HotelModule } from './hotel/hotels.module';
import { UsersModule } from './users/users.module';
import { AuthModule } from './auth/auth.module';
import { BookingsModule } from './bookings/bookings.module';
import { RoomModule } from './room/room.module';

@Module({
  imports: [
    // ✅ โหลดไฟล์ .env ให้ใช้ได้ทั้งโปรเจกต์
    ConfigModule.forRoot({ isGlobal: true }),

    // ✅ ต่อ MongoDB จาก env: MONGODB_URI
    MongooseModule.forRootAsync({
      inject: [ConfigService],
      useFactory: async (configService: ConfigService) => {
        const uri = configService.get<string>('MONGODB_URI');
        if (!uri) throw new Error('Missing env: MONGODB_URI');
        return { uri };
      },
    }),

    // ✅ Modules ของคุณ
    HotelModule,
    UsersModule,
    AuthModule,
    BookingsModule,
    RoomModule,
  ],
})
export class AppModule {}
