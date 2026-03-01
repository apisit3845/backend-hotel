import { Controller, Post, Body, Get } from '@nestjs/common';
import { PaymentService } from './payment.service';

@Controller('payments')
export class PaymentController {
  constructor(private paymentService: PaymentService) {}

  @Post()
  async pay(
    @Body('bookingId') bookingId: string,
    @Body('amount') amount: number,
  ) {
    return this.paymentService.createPayment(bookingId, amount);
  }

  @Get()
  async findAll() {
    return this.paymentService.getAll();
  }
}