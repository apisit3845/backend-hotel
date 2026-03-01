import {
  IsOptional,
  IsString,
  IsNumber,
  IsDateString,
  Min,
  Max,
  IsMongoId,
} from 'class-validator';
import { Type } from 'class-transformer';

export class UpdateBookingDto {
 @IsOptional()
  @IsString()
  hotelId: string;

  @IsOptional()
  @IsMongoId()
  hotelName?: string;

  @IsOptional()
  @IsString()
  name?: string;

  @IsOptional()
  @IsString()
  phone?: string;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  @Max(10000000)
  price?: number;

  @IsOptional()
  @IsDateString()
  checkin?: string;

  @IsOptional()
  @IsDateString()
  checkout?: string;
}