import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
  UseInterceptors,
  UploadedFile,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';

import { HotelService } from './hotels.service';
import { CreateHotelDto } from './dto/create-hotel.dto';
import { UpdateHotelDto } from './dto/update-hotel.dto';

@Controller('hotels')
export class HotelController {
  constructor(private readonly hotelService: HotelService) {}

  // ===============================
  // ✅ Upload Image
  // ===============================
  @Post('upload')
  @UseInterceptors(
    FileInterceptor('file', {
      storage: diskStorage({
        destination: './uploads',
        filename: (req, file, callback) => {
          const uniqueName = Date.now() + '-' + file.originalname;
          callback(null, uniqueName);
        },
      }),
    }),
  )
  uploadFile(@UploadedFile() file: Express.Multer.File) {
    return {
      imageUrl: `http://localhost:3001/uploads/${file.filename}`,
    };
  }

  // ===============================
  // ✅ POST /hotels
  // ===============================
  @Post()
  create(@Body() createHotelDto: CreateHotelDto) {
    return this.hotelService.create(createHotelDto);
  }

  // ===============================
  // ✅ GET /hotels/search
  // ===============================
  @Get('search')
  search(
    @Query('location') location?: string,
    @Query('minPrice') minPrice?: string,
    @Query('maxPrice') maxPrice?: string,
    @Query('q') q?: string,
    @Query('sortBy') sortBy?: string,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ) {
    return this.hotelService.search({
      location,
      minPrice: minPrice ? Number(minPrice) : undefined,
      maxPrice: maxPrice ? Number(maxPrice) : undefined,
      q,
      sortBy,
      page: page ? Number(page) : 1,
      limit: limit ? Number(limit) : 10,
    });
  }

  // ===============================
  // ✅ GET /hotels
  // ===============================
  @Get()
  findAll(
    @Query('city') city?: string,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ) {
    // ถ้ามี city → ใช้ search logic
    if (city) {
      return this.hotelService.search({
        location: city,
        page: page ? Number(page) : 1,
        limit: limit ? Number(limit) : 10,
      });
    }

    return this.hotelService.findAll(
      page ? Number(page) : 1,
      limit ? Number(limit) : 10,
    );
  }

  // ===============================
  // ✅ GET /hotels/:id
  // ===============================
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.hotelService.findOne(id);
  }

  // ===============================
  // ✅ PATCH /hotels/:id
  // ===============================
  @Patch(':id')
  update(@Param('id') id: string, @Body() updateHotelDto: UpdateHotelDto) {
    return this.hotelService.update(id, updateHotelDto);
  }

  // ===============================
  // ✅ DELETE /hotels/:id
  // ===============================
  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.hotelService.remove(id);
  }
}
