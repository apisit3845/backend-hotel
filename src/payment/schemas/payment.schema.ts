import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

@Schema({ timestamps: true })
export class Payment extends Document {
  @Prop({ type: Types.ObjectId, ref: 'Booking', required: true })
  bookingId: Types.ObjectId;

  @Prop({ required: true })
  amount: number;

  @Prop({ default: 'pending' })
  status: string; // pending | paid

  @Prop()
  method: string; // credit_card | qr | mock
}

export const PaymentSchema = SchemaFactory.createForClass(Payment);