import {
  IsOptional,
  IsString,
  IsEmail,
  IsDateString,
  IsEnum,
  IsNumber,
  Min,
  Max,
} from 'class-validator';
import { Type } from 'class-transformer';

export enum BookingSort {
  PRICE_ASC = 'price_asc',
  PRICE_DESC = 'price_desc',
  CHECKIN_ASC = 'checkin_asc',
  CHECKIN_DESC = 'checkin_desc',
}

export class SearchBookingDto {
  @IsOptional()
  @IsString()
  hotelName?: string;

  @IsOptional()
  @IsString()
  name?: string;

  // filter ช่วงวัน checkin
  @IsOptional()
  @IsDateString()
  checkinFrom?: string;

  @IsOptional()
  @IsDateString()
  checkinTo?: string;

  // filter ราคา
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  @Max(1000000)
  minPrice?: number;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  @Max(1000000)
  maxPrice?: number;


  // sort
  @IsOptional()
  @IsEnum(BookingSort)
  sort?: BookingSort;
}