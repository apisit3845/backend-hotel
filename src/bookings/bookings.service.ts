import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  BadRequestException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Booking, BookingDocument } from './schemas/booking.schema';
import { CreateBookingDto } from './dto/create-booking.dto';
import { UpdateBookingDto } from './dto/update.booking.dto';
import { SearchBookingDto } from './dto/search.booking';
import { AdminSearchBookingDto } from './dto/admin-search-booking.dto';
import { Hotel, HotelDocument } from '../hotel/schemas/hotels.schema';
import { Room, RoomDocument } from '../room/schemas/room.schema';

@Injectable()
export class BookingsService {
  constructor(
    @InjectModel(Booking.name)
    private bookingModel: Model<BookingDocument>,

    @InjectModel(Hotel.name)
    private hotelModel: Model<HotelDocument>,

    @InjectModel(Room.name)
    private roomModel: Model<RoomDocument>,
  ) {}

  // ===============================
  // 🔥 CONFIRM DATA
  // ===============================

  async getConfirmData(hotelId: string, roomId: string) {
    const hotel = await this.hotelModel
      .findById(new Types.ObjectId(hotelId))
      .lean()
      .exec();

    if (!hotel) throw new NotFoundException('Hotel not found');

    const room = await this.roomModel.findById(roomId).lean().exec();
    if (!room) throw new NotFoundException('Room not found');

    return {
      hotelName: hotel.hotelName,
      location: hotel.location,
      roomPrice: room.price,
      nights: 1,
      roomCount: 1,
    };
  }

  // ===============================
  // 👤 CREATE BOOKING
  // ===============================

  async create(createBookingDto: CreateBookingDto, userId: string) {
    const bookingNo = Date.now() + Math.floor(Math.random() * 100);

    const createdBooking = new this.bookingModel({
      ...createBookingDto,
      bookingNo,
      user: new Types.ObjectId(userId),
      hotelId: new Types.ObjectId(createBookingDto.hotelId),
      checkin: new Date(createBookingDto.checkin),
      checkout: new Date(createBookingDto.checkout),
      status: 'pending',
    });

    return createdBooking.save();
  }

  // ===============================
  // 👤 USER SEARCH (ของเดิม)
  // ===============================

  async findAll(query: SearchBookingDto) {
    const filter: any = {};

    if (query.hotelName) {
      filter.hotelName = { $regex: query.hotelName, $options: 'i' };
    }

    return this.bookingModel.find(filter).lean().exec();
  }

  // ===============================
  // 👑 ADMIN PANEL (ใหม่)
  // ===============================

  async findAllAdmin(query: AdminSearchBookingDto) {
    const page = Number(query.page) || 1;
    const limit = Number(query.limit) || 10;
    const skip = (page - 1) * limit;

    const matchStage: any = {};

    if (query.status) {
      matchStage.status = query.status;
    }

    const pipeline: any[] = [
      {
        $lookup: {
          from: 'users',
          localField: 'user',
          foreignField: '_id',
          as: 'user',
        },
      },
      { $unwind: '$user' },
    ];
    if (query.search) {
      pipeline.push({
        $match: {
          name: { $regex: query.search, $options: 'i' },
        },
      });
    }

    if (query.status) {
      pipeline.push({ $match: { status: query.status } });
    }

    const totalResult = await this.bookingModel.aggregate([
      ...pipeline,
      { $count: 'total' },
    ]);

    const total = totalResult[0]?.total || 0;

    const data = await this.bookingModel.aggregate([
      ...pipeline,
      { $sort: { createdAt: -1 } },
      { $skip: skip },
      { $limit: limit },
    ]);

    // ===== SUMMARY =====
    const allConfirmed = await this.bookingModel.find({
      status: 'confirmed',
    });

    const totalRevenue = allConfirmed.reduce(
      (sum, b) => sum + (b.price || 0),
      0,
    );

    const confirmed = await this.bookingModel.countDocuments({
      status: 'confirmed',
    });

    const cancelled = await this.bookingModel.countDocuments({
      status: 'cancelled',
    });

    const pending = await this.bookingModel.countDocuments({
      status: 'pending',
    });

    // ===== MONTHLY REVENUE =====
    const monthlyAgg = await this.bookingModel.aggregate([
      { $match: { status: 'confirmed' } },
      {
        $group: {
          _id: { $month: '$createdAt' },
          revenue: { $sum: '$price' },
        },
      },
      { $sort: { _id: 1 } },
    ]);

    const monthlyRevenue = monthlyAgg.map((m) => ({
      month: m._id,
      revenue: m.revenue,
    }));

    return {
      data,
      total,
      page,
      totalPages: Math.ceil(total / limit),
      summary: {
        totalRevenue,
        confirmed,
        cancelled,
        pending,
      },
      monthlyRevenue,
    };
  }

  // ===============================
  // 🔍 COMMON
  // ===============================

  async findOne(id: string) {
    const booking = await this.bookingModel.findById(id).exec();
    if (!booking)
      throw new NotFoundException(`Booking with ID ${id} not found`);
    return booking;
  }

  async findOneForUser(id: string, userId: string) {
    const booking = await this.bookingModel.findById(id).exec();
    if (!booking) throw new NotFoundException('Booking not found');

    if (booking.user.toString() !== userId)
      throw new ForbiddenException('Forbidden resource');

    return booking;
  }

  async update(id: string, dto: UpdateBookingDto) {
    const updated = await this.bookingModel
      .findByIdAndUpdate(id, dto, { new: true })
      .exec();

    if (!updated)
      throw new NotFoundException(`Booking with ID ${id} not found`);

    return updated;
  }

  async confirm(id: string) {
    const confirmed = await this.bookingModel
      .findByIdAndUpdate(id, { status: 'confirmed' }, { new: true })
      .exec();

    if (!confirmed)
      throw new NotFoundException(`Booking with ID ${id} not found`);

    return confirmed;
  }

  async cancelBooking(id: string, userId: string) {
    const booking = await this.bookingModel.findById(id).exec();
    if (!booking) throw new NotFoundException('Booking not found');

    if (booking.user.toString() !== userId)
      throw new ForbiddenException('You cannot cancel this booking');

    if (booking.status === 'cancelled')
      throw new BadRequestException('Booking already cancelled');

    if (new Date() > booking.checkin)
      throw new BadRequestException(
        'Cannot cancel booking after check-in date',
      );

    booking.status = 'cancelled';
    return booking.save();
  }

  async remove(id: string) {
    const deleted = await this.bookingModel.findByIdAndDelete(id).exec();
    if (!deleted)
      throw new NotFoundException(`Booking with ID ${id} not found`);
    return deleted;
  }

  async findByUser(userId: string) {
    return this.bookingModel
      .find({ user: new Types.ObjectId(userId) })
      .sort({ createdAt: -1 });
  }
}
