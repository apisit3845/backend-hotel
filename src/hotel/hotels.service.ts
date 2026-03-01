import {
  Injectable,
  BadRequestException,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, isValidObjectId, Types } from 'mongoose';

import { Hotel, HotelDocument } from './schemas/hotels.schema';
import { Room, RoomDocument } from '../room/schemas/room.schema';

import { CreateHotelDto } from './dto/create-hotel.dto';
import { UpdateHotelDto } from './dto/update-hotel.dto';

@Injectable()
export class HotelService {
  constructor(
    @InjectModel(Hotel.name)
    private readonly hotelModel: Model<HotelDocument>,

    @InjectModel(Room.name)
    private readonly roomModel: Model<RoomDocument>,
  ) {}

  // ================= PRIVATE HELPER =================
  private validateObjectId(id: string) {
    if (!isValidObjectId(id)) {
      throw new BadRequestException('Invalid hotel ID');
    }
  }

  private normalizeCity(input: string): string {
    const cityMap: Record<string, string> = {
      'เชียงใหม่': 'Chiang Mai',
      'chiangmai': 'Chiang Mai',
      'chiang mai': 'Chiang Mai',
      'กรุงเทพ': 'Bangkok',
      'bangkok': 'Bangkok',
      'ภูเก็ต': 'Phuket',
      'phuket': 'Phuket',
    };

    const key = input.trim().toLowerCase();
    return cityMap[key] || input.trim();
  }

  // ================= CREATE =================
  async create(dto: CreateHotelDto) {
    return this.hotelModel.create(dto);
  }

  // ================= GET ALL =================
  async findAll(page = 1, limit = 10) {
    page = Math.max(1, Number(page));
    limit = Math.max(1, Number(limit));

    const skip = (page - 1) * limit;

    const [data, total] = await Promise.all([
      this.hotelModel
        .find()
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),

      this.hotelModel.countDocuments(),
    ]);

    return {
      data,
      total,
      page,
      totalPages: Math.ceil(total / limit),
    };
  }

  // ================= GET ONE (พร้อม rooms) =================
  async findOne(id: string) {
    this.validateObjectId(id);

    const objectId = new Types.ObjectId(id);

    const hotel = await this.hotelModel.findById(objectId).lean();

    if (!hotel) {
      throw new NotFoundException('Hotel not found');
    }

    const rooms = await this.roomModel
      .find({ hotelId: objectId })
      .lean();

    return {
      ...hotel,
      rooms,
    };
  }

  // ================= UPDATE =================
  async update(id: string, dto: UpdateHotelDto) {
    this.validateObjectId(id);

    const updated = await this.hotelModel
      .findByIdAndUpdate(id, dto, { new: true })
      .lean();

    if (!updated) {
      throw new NotFoundException('Hotel not found');
    }

    return updated;
  }

  // ================= DELETE (Cascade rooms) =================
  async remove(id: string) {
    this.validateObjectId(id);

    const objectId = new Types.ObjectId(id);

    const deleted = await this.hotelModel
      .findByIdAndDelete(objectId)
      .lean();

    if (!deleted) {
      throw new NotFoundException('Hotel not found');
    }

    // 🔥 ลบ rooms ที่เกี่ยวข้องทั้งหมด
    await this.roomModel.deleteMany({ hotelId: objectId });

    return deleted;
  }

  // ================= SEARCH =================
  async search(filters: {
    location?: string;
    minPrice?: number;
    maxPrice?: number;
    q?: string;
    sortBy?: string;
    page?: number;
    limit?: number;
  }) {
    const query: any = {};

    // 🔎 Location
    if (filters.location?.trim()) {
      const normalizedCity = this.normalizeCity(filters.location);

      query.location = {
        $regex: normalizedCity,
        $options: 'i',
      };
    }

    // 💰 Price filter
    if (filters.minPrice != null || filters.maxPrice != null) {
      query.price = {};

      if (filters.minPrice != null)
        query.price.$gte = Number(filters.minPrice);

      if (filters.maxPrice != null)
        query.price.$lte = Number(filters.maxPrice);
    }

    // 🔍 Keyword
    if (filters.q?.trim()) {
      const kw = filters.q.trim();

      query.$or = [
        { hotelName: { $regex: kw, $options: 'i' } },
        { description: { $regex: kw, $options: 'i' } },
      ];
    }

    // 📊 Sorting
    const sortMap: Record<string, any> = {
      priceAsc: { price: 1 },
      priceDesc: { price: -1 },
      newest: { createdAt: -1 },
    };

    const sortOption = sortMap[filters.sortBy || ''] || { createdAt: -1 };

    // 📄 Pagination
    const page = Math.max(1, Number(filters.page) || 1);
    const limit = Math.max(1, Number(filters.limit) || 10);
    const skip = (page - 1) * limit;

    const [data, total] = await Promise.all([
      this.hotelModel
        .find(query)
        .sort(sortOption)
        .skip(skip)
        .limit(limit)
        .lean(),

      this.hotelModel.countDocuments(query),
    ]);

    return {
      data,
      total,
      page,
      totalPages: Math.ceil(total / limit),
    };
  }
}