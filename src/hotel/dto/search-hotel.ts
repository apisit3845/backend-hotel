import { IsIn, IsNumberString, IsOptional, IsString } from 'class-validator';

export class SearchHotelDto {

   
  @IsOptional()
  @IsString()
  name?: string;

  @IsOptional()
  @IsString()
  location?: string;

  @IsOptional()
  @IsNumberString()
  minPrice?: string;
  
  
  @IsOptional()
  @IsNumberString()
  maxPrice?: string;

  @IsOptional()
  @IsIn(['price_asc', 'price_desc'])  // กำหนดให้ sort มีค่าได้แค่ 'price_asc' หรือ 'price_desc'
  sort?: 'price_asc' | 'price_desc';
    
}
