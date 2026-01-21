import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ServiceProvider } from './entities/service-provider.entity';

@Injectable()
export class ServiceProvidersService {
  constructor(
    @InjectRepository(ServiceProvider)
    private readonly providerRepo: Repository<ServiceProvider>,
  ) {}

  /**
   * Find providers by skill ID
   */
  async findBySkillId(
    skillId: string,
    filters?: { state?: string; city?: string },
  ): Promise<ServiceProvider[]> {
    const qb = this.baseProviderQuery();

    qb.innerJoin(
      'service_provider_skills',
      'sps',
      'sps.service_provider_id = provider.id',
    )
      .innerJoin(
        'service_category_skills',
        'skill',
        'skill.id = sps.service_category_skill_id',
      )
      .andWhere('skill.id = :skillId', { skillId });

    this.applyLocationFilters(qb, filters);

    return this.mapAverageRating(await qb.getRawAndEntities());
  }

  /**
   * Find providers by category ID
   */
  async findByCategoryId(
    categoryId: string,
    filters?: { state?: string; city?: string },
  ): Promise<ServiceProvider[]> {
    const qb = this.baseProviderQuery();

    qb.innerJoin(
      'service_provider_skills',
      'sps',
      'sps.service_provider_id = provider.id',
    )
      .innerJoin(
        'service_category_skills',
        'skill',
        'skill.id = sps.service_category_skill_id',
      )
      .innerJoin(
        'service_categories',
        'cat',
        'cat.id = skill.service_category_id',
      )
      .andWhere('cat.id = :categoryId', { categoryId });

    this.applyLocationFilters(qb, filters);

    return this.mapAverageRating(await qb.getRawAndEntities());
  }

  /**
   * Base provider query (shared)
   */
  private baseProviderQuery() {
    return this.providerRepo
      .createQueryBuilder('provider')
      .leftJoinAndSelect('provider.profile', 'profile')
      .leftJoinAndSelect('provider.skills', 'skills')
      .leftJoinAndSelect('skills.category', 'category')
      .addSelect(
        (qb) =>
          qb
            .select(
              'COALESCE(AVG(CAST(review.stars::text AS NUMERIC)), 0)',
              'averageRating',
            )
            .from('reviews', 'review')
            .where('review.service_provider_id = provider.id')
            .andWhere('review.deletedAt IS NULL'),
        'averageRating',
      )
      .distinctOn(['provider.id']);
  }

  /**
   * Apply state / city filters
   */
  private applyLocationFilters(
    qb,
    filters?: { state?: string; city?: string },
  ) {
    if (!filters) return;

    if (filters.state) {
      qb.andWhere('provider.state ILIKE :state', {
        state: filters.state,
      });
    }

    if (filters.city) {
      qb.andWhere('provider.city ILIKE :city', {
        city: filters.city,
      });
    }
  }

  /**
   * Map average rating from raw results to entities
   */
  private mapAverageRating(result: {
    raw: any[];
    entities: ServiceProvider[];
  }): ServiceProvider[] {
    return result.entities.map((provider, index) => ({
      ...provider,
      averageRating: parseFloat(result.raw[index]?.averageRating) || 0,
    }));
  }
}
