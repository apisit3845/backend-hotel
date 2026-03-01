import {
  Controller,
  Post,
  Body,
  Get,
  Param,
  Patch,
  Delete,
  Query,
  UseGuards,
  Req,
} from '@nestjs/common';
import { Request } from 'express';

import { SearchBookingDto } from './dto/search.booking';
import { AdminSearchBookingDto } from './dto/admin-search-booking.dto'; // ✅ เพิ่มอันนี้
import { BookingsService } from './bookings.service';
import { CreateBookingDto } from './dto/create-booking.dto';
import { UpdateBookingDto } from './dto/update.booking.dto';

import { AccessTokenGuard } from '../auth/guards/access-token.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';

@Controller('bookings')
export class BookingsController {
  constructor(private readonly bookingsService: BookingsService) {}

  // ===============================
  // 👤 USER
  // ===============================

  @UseGuards(AccessTokenGuard)
  @Post()
  create(
    @Body() createBookingDto: CreateBookingDto,
    @Req() req: Request & { user: { userId: string; role: string } },
  ) {
    return this.bookingsService.create(createBookingDto, req.user.userId);
  }

  @UseGuards(AccessTokenGuard)
  @Get('my')
  findMyBookings(
    @Req() req: Request & { user: { userId: string } },
  ) {
    return this.bookingsService.findByUser(req.user.userId);
  }

  @UseGuards(AccessTokenGuard)
  @Get('my/:id')
  findMyBookingById(
    @Param('id') id: string,
    @Req() req: Request & { user: { userId: string } },
  ) {
    return this.bookingsService.findOneForUser(id, req.user.userId);
  }

  @UseGuards(AccessTokenGuard)
  @Patch('my/:id/cancel')
  cancelMyBooking(
    @Param('id') id: string,
    @Req() req: Request & { user: { userId: string } },
  ) {
    return this.bookingsService.cancelBooking(id, req.user.userId);
  }

  // ===============================
  // 🔓 PUBLIC
  // ===============================

  @Get('confirm-data')
  getConfirmData(
    @Query('hotelId') hotelId: string,
    @Query('roomId') roomId: string,
  ) {
    return this.bookingsService.getConfirmData(hotelId, roomId);
  }

  // ===============================
  // 👑 ADMIN
  // ===============================

  // ✅ ใช้ DTO ใหม่สำหรับ Admin
  @UseGuards(AccessTokenGuard, RolesGuard)
  @Roles('admin')
  @Get()
  findAll(@Query() query: AdminSearchBookingDto) {
    return this.bookingsService.findAllAdmin(query);
  }

  @UseGuards(AccessTokenGuard, RolesGuard)
  @Roles('admin')
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.bookingsService.findOne(id);
  }

  @UseGuards(AccessTokenGuard, RolesGuard)
  @Roles('admin')
  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updateBookingDto: UpdateBookingDto,
  ) {
    return this.bookingsService.update(id, updateBookingDto);
  }

  @UseGuards(AccessTokenGuard, RolesGuard)
  @Roles('admin')
  @Patch(':id/confirm')
  confirm(@Param('id') id: string) {
    return this.bookingsService.confirm(id);
  }

  @UseGuards(AccessTokenGuard, RolesGuard)
  @Roles('admin')
  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.bookingsService.remove(id);
  }
}