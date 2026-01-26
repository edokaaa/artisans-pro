import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { ServiceCategory } from './entities/service-category.entity';
import { ServiceCategorySkill } from './entities/service-category-skill.entity';
import { CreateCategoryDto } from './dto/create-category.dto';
import { CreateCategorySkillDto } from './dto/create-category-skill.dto';

@Injectable()
export class CategoriesService {
  constructor(
    @InjectRepository(ServiceCategory)
    private readonly categoryRepo: Repository<ServiceCategory>,

    @InjectRepository(ServiceCategorySkill)
    private readonly skillRepo: Repository<ServiceCategorySkill>,
  ) {}

  /* ----------------------------------------
   * Categories
   * -------------------------------------- */

  async createCategory(dto: CreateCategoryDto): Promise<ServiceCategory> {
    const existing = await this.categoryRepo.findOne({
      where: { slug: dto.slug },
    });

    if (existing) {
      throw new BadRequestException('Category slug already exists');
    }

    const category = this.categoryRepo.create(dto);
    return this.categoryRepo.save(category);
  }

  async updateCategory(
    id: string,
    dto: Partial<ServiceCategory>,
  ): Promise<ServiceCategory> {
    const category = await this.categoryRepo.findOne({ where: { id } });
    if (!category) throw new NotFoundException('Category not found');

    if (dto.slug && dto.slug !== category.slug) {
      const slugExists = await this.categoryRepo.findOne({
        where: { slug: dto.slug },
      });

      if (slugExists) {
        throw new BadRequestException('Category slug already exists');
      }
    }

    Object.assign(category, dto);
    return this.categoryRepo.save(category);
  }

  // async getAllCategories(): Promise<ServiceCategory[]> {
  //   return this.categoryRepo.find({
  //     relations: ['skills'],
  //     order: { name: 'ASC' },
  //   });
  // }

  async getCategoryBySlug(slug: string): Promise<ServiceCategory> {
    const category = await this.categoryRepo.findOne({
      where: { slug },
      relations: ['skills'],
    });

    if (!category) {
      throw new NotFoundException('Category not found');
    }

    return category;
  }

  /* ----------------------------------------
   * Category Skills
   * -------------------------------------- */

  async addSkillToCategory(
    categoryId: string,
    dto: CreateCategorySkillDto,
  ): Promise<ServiceCategorySkill> {
    const category = await this.categoryRepo.findOne({
      where: { id: categoryId },
      relations: ['skills'],
    });

    if (!category) {
      throw new NotFoundException('Category not found');
    }

    const existingSkill = await this.skillRepo.findOne({
      where: {
        slug: dto.slug,
        category: { id: category.id },
      },
      relations: ['serviceCategory'],
    });

    if (existingSkill) {
      throw new BadRequestException(
        'Skill slug already exists for this category',
      );
    }

    const skill = this.skillRepo.create({
      ...dto,
      category: category,
    });

    return this.skillRepo.save(skill);
  }

  async updateCategorySkill(
    skillId: string,
    dto: Partial<ServiceCategorySkill>,
  ): Promise<ServiceCategorySkill> {
    const skill = await this.skillRepo.findOne({
      where: { id: skillId },
      relations: ['serviceCategory'],
    });

    if (!skill) {
      throw new NotFoundException('Skill not found');
    }

    if (dto.slug && dto.slug !== skill.slug) {
      const exists = await this.skillRepo.findOne({
        where: {
          slug: dto.slug,
          category: { id: skill.category.id },
        },
      });

      if (exists) {
        throw new BadRequestException(
          'Skill slug already exists for this category',
        );
      }
    }

    Object.assign(skill, dto);
    return this.skillRepo.save(skill);
  }

  async getSkillsByCategory(
    categoryId: string,
  ): Promise<ServiceCategorySkill[]> {
    return this.skillRepo.find({
      where: { category: { id: categoryId } },
      order: { name: 'ASC' },
    });
  }

  async getAllCategories(q?: string): Promise<ServiceCategory[]> {
    const qb = this.categoryRepo
      .createQueryBuilder('category')
      .leftJoinAndSelect('category.skills', 'skill')
      .distinct(true);

    if (!q) {
      return qb.orderBy('category.name', 'ASC').getMany();
    }

    const isUUID =
      /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(q);

    qb.where('category.name ILIKE :q', { q: `%${q}%` })
      .orWhere('category.slug ILIKE :q', { q: `%${q}%` })
      .orWhere('skill.name ILIKE :q', { q: `%${q}%` })
      .orWhere('skill.slug ILIKE :q', { q: `%${q}%` });

    if (isUUID) {
      qb.orWhere('category.id = :id', { id: q }).orWhere('skill.id = :id', {
        id: q,
      });
    }

    return qb.orderBy('category.name', 'ASC').getMany();
  }
}
