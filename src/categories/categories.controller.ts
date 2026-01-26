import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';

import { CategoriesService } from './categories.service';
import { JwtAuthGuard } from 'src/auth/guards/jwt.guard';
import { RolesGuard } from 'src/auth/guards/roles.guard';
import { Roles } from 'src/auth/decorators/roles.decorator';

import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';
import { CreateCategorySkillDto } from './dto/create-category-skill.dto';
import { SearchCategoriesDto } from './dto/search-categories.dto';

@Controller('categories')
export class CategoriesController {
  constructor(private readonly categoriesService: CategoriesService) {}

  /* ----------------------------------------
   * Public
   * -------------------------------------- */

  @Get()
  getAllCategories(@Query() query: SearchCategoriesDto) {
    return this.categoriesService.getAllCategories(query.q);
  }

  @Get(':slug')
  getCategoryBySlug(@Param('slug') slug: string) {
    return this.categoriesService.getCategoryBySlug(slug);
  }

  /* ----------------------------------------
   * Admin
   * -------------------------------------- */

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  @Post()
  createCategory(@Body() dto: CreateCategoryDto) {
    return this.categoriesService.createCategory(dto);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  @Patch(':id')
  updateCategory(@Param('id') id: string, @Body() dto: UpdateCategoryDto) {
    return this.categoriesService.updateCategory(id, dto);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  @Post(':id/skills')
  addSkill(
    @Param('id') categoryId: string,
    @Body() dto: CreateCategorySkillDto,
  ) {
    return this.categoriesService.addSkillToCategory(categoryId, dto);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  @Patch('skills/:skillId')
  updateSkill(
    @Param('skillId') skillId: string,
    @Body() dto: Partial<CreateCategorySkillDto>,
  ) {
    return this.categoriesService.updateCategorySkill(skillId, dto);
  }
}
