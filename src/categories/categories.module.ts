import { Module } from '@nestjs/common';
import { CategoriesController } from './categories.controller';
import { CategoriesService } from './categories.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ServiceCategorySkill } from './entities/service-category-skill.entity';
import { ServiceCategory } from './entities/service-category.entity';

@Module({
  imports: [TypeOrmModule.forFeature([ServiceCategorySkill, ServiceCategory])],
  controllers: [CategoriesController],
  providers: [CategoriesService],
})
export class CategoriesModule {}
