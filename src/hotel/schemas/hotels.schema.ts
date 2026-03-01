import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

export type HotelDocument = HydratedDocument<Hotel>;

@Schema({ timestamps: true })
export class Hotel {

  @Prop({ required: true })
  hotelName: string;

  @Prop({ required: true, type: Number })
  price: number;

  @Prop({ required: true })
  location: string;

  @Prop({ required: true })
  description: string;

  @Prop({ default: '' })
  imageUrl: string;
}

export const HotelSchema = SchemaFactory.createForClass(Hotel);