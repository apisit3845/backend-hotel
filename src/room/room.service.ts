import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Room, RoomDocument } from './schemas/room.schema';

@Injectable()
export class RoomService {
  constructor(
    @InjectModel(Room.name)
    private roomModel: Model<RoomDocument>,
  ) {}

  async create(data: any) {
    return this.roomModel.create(data);
  }

  async findAll() {
    return this.roomModel.find().populate('hotelId');
  }

  async findByHotel(hotelId: string) {
    if (!Types.ObjectId.isValid(hotelId)) {
      throw new BadRequestException('Invalid hotel ID');
    }

    const rooms = await this.roomModel
      .find({ hotelId }) // ✅ ให้ mongoose แปลง ObjectId เอง
      .populate('hotelId');

    return rooms;
  }

  async findOne(id: string) {
    if (!Types.ObjectId.isValid(id)) {
      throw new BadRequestException('Invalid room ID');
    }

    const room = await this.roomModel
      .findById(id)
      .populate('hotelId');

    if (!room) {
      throw new NotFoundException('Room not found');
    }

    return room;
  }

  async update(id: string, data: any) {
    if (!Types.ObjectId.isValid(id)) {
      throw new BadRequestException('Invalid room ID');
    }

    const updated = await this.roomModel.findByIdAndUpdate(id, data, {
      new: true,
    });

    if (!updated) {
      throw new NotFoundException('Room not found');
    }

    return updated;
  }

  async remove(id: string) {
    if (!Types.ObjectId.isValid(id)) {
      throw new BadRequestException('Invalid room ID');
    }

    const deleted = await this.roomModel.findByIdAndDelete(id);

    if (!deleted) {
      throw new NotFoundException('Room not found');
    }

    return deleted;
  }
}