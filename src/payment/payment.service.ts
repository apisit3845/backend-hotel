import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Payment } from './schemas/payment.schema';
import { Booking } from '../bookings/schemas/booking.schema';

@Injectable()
export class PaymentService {
  constructor(
    @InjectModel(Payment.name) private paymentModel: Model<Payment>,
    @InjectModel(Booking.name) private bookingModel: Model<Booking>,
  ) {}

  async createPayment(bookingId: string, amount: number) {
    const booking = await this.bookingModel.findById(bookingId);
    if (!booking) throw new NotFoundException('Booking not found');

    const payment = await this.paymentModel.create({
      bookingId,
      amount,
      status: 'paid',
      method: 'mock',
    });

    booking.status = 'confirmed';
    await booking.save();

    return payment;
  }

  async getAll() {
    return this.paymentModel.find().populate('bookingId');
  }
}