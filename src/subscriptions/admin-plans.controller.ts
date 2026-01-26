import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';
import { PlanService } from './plan.service';
import { JwtAuthGuard } from 'src/auth/guards/jwt.guard';
import { AdminCreatePlanDto } from './dto/admin-create-plan.dto';
import { Response } from 'src/common/utils/response';

@Controller('admin/plans')
@UseGuards(JwtAuthGuard)
// @Roles('admin')
export class AdminPlansController {
  constructor(private readonly planService: PlanService) {}

  @Post()
  async create(@Body() dto: AdminCreatePlanDto) {
    const response = await this.planService.create(dto);

    return new Response('success', response);
  }

  @Get()
  async findAll() {
    const response = await this.planService.findAll();

    return new Response('success', response);
  }

  @Patch(':id')
  async update(
    @Param('id') id: string,
    @Body() dto: Partial<AdminCreatePlanDto>,
  ) {
    const response = await this.planService.update(id, {
      name: dto.name,
      price: dto.price,
    });

    return new Response('success', response);
  }

  @Patch(':id/deactivate')
  async deactivate(@Param('id') id: string) {
    const response = await this.planService.deactivate(id);

    return new Response('success', response);
  }
}
