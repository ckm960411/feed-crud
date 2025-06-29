import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Coupon } from 'src/entities/coupon.entity';
import { Repository } from 'typeorm';
import { CreateCouponReqDto } from './dto/reqeust/create-coupon.req.dto';

@Injectable()
export class CouponService {
  constructor(
    @InjectRepository(Coupon)
    private readonly couponRepository: Repository<Coupon>,
  ) {}

  async createCoupon(dto: CreateCouponReqDto) {
    const coupon = this.couponRepository.create(dto);
    return this.couponRepository.save(coupon);
  }
}
