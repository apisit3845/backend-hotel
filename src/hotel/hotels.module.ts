import { Module } from "@nestjs/common";
import { MongooseModule } from "@nestjs/mongoose";
 
import { HotelController } from "./hotels.controller";
import { HotelService } from "./hotels.service";
import { Hotel, HotelSchema } from "./schemas/hotels.schema";
import { Room, RoomSchema } from "../room/schemas/room.schema"; // 👈 เพิ่มบรรทัดนี้
 
@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Hotel.name, schema: HotelSchema },
      { name: Room.name, schema: RoomSchema }, // 👈 เพิ่มตรงนี้
    ]),
  ],
  controllers: [HotelController],
  providers: [HotelService],
  exports: [HotelService],
})
export class HotelModule {}