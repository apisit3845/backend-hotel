import {
  IsDateString,
  IsEmail,
  IsNotEmpty,
  IsNumber,
  IsString,
} from 'class-validator';
import { Type } from 'class-transformer';

export class CreateBookingDto {

@IsNotEmpty() 
  @IsString()
  hotelId: string;

  @IsNotEmpty() 
  @IsString()
  hotelName: string;

  @IsNotEmpty() 
  @IsString()
  name: string;

  @IsNotEmpty()
  @IsString()
  phone: string;   

  @IsNotEmpty()
  @Type(() => Number)
  @IsNumber()
  price: number;

  @IsNotEmpty()
  @IsDateString()
  checkin: string;

  @IsNotEmpty()
  @IsDateString()
  checkout: string;
}
