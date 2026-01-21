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
   * Get One Service Provider
   */
  async getById(id: string): Promise<ServiceProvider> {
    const result = await this.providerRepo
      .createQueryBuilder('provider')
      .leftJoinAndSelect('provider.profile', 'profile')
      .leftJoinAndSelect('provider.reviews', 'reviews')
      .leftJoinAndSelect('provider.jobs', 'jobs')
      .leftJoinAndSelect('reviews.reply', 'reply')
      .leftJoinAndSelect('profile.user', 'user')
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
      .where('provider.id = :id', { id })
      .getRawAndEntities();

    if (!result.entities.length) {
      throw new Error('Service provider not found');
    }

    const provider = result.entities[0];
    return {
      ...provider,
      averageRating: parseFloat(result.raw[0]?.averageRating) || 0,
    };
  }

  /**
   * Find providers by skill ID
   */
  async findBySkillId(
    skillId: string,
    filters?: {
      state?: string;
      city?: string;
      latitude?: number;
      longitude?: number;
    },
  ): Promise<ServiceProvider[]> {
    const qb = this.baseProviderQuery(filters);

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
    filters?: {
      state?: string;
      city?: string;
      latitude?: number;
      longitude?: number;
    },
  ): Promise<ServiceProvider[]> {
    const qb = this.baseProviderQuery(filters);

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

  async getWithJobs (providerId: string) {
    return await this.providerRepo.findOne({
      where: { id: providerId },
      relations: ['jobs'],
    });
  }

  /**
   * Base provider query (shared)
   */
  private baseProviderQuery(filters?: {
    latitude?: number;
    longitude?: number;
  }) {
    const qb = this.providerRepo
      .createQueryBuilder('provider')
      .leftJoinAndSelect('provider.profile', 'profile')
      .leftJoinAndSelect('provider.skills', 'skills')
      .leftJoinAndSelect('skills.category', 'category');

    if (filters?.latitude && filters?.longitude) {
      qb.addSelect(
        `
          ST_Distance(
            profile.location,
            ST_SetSRID(ST_MakePoint(:lng, :lat), 4326)::geography
          ) / 1000
          `,
        'distance_km',
      ).setParameters({
        lat: filters?.latitude,
        lng: filters?.longitude,
      });
    }

    qb.addSelect(
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
      .distinctOn(['provider.id'])
      .orderBy('provider.id', 'ASC');

    // Add distance ordering if location filters provided
    if (filters?.latitude && filters?.longitude) {
      qb.addOrderBy('distance_km', 'ASC');
    }

    return qb;
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
      distanceKm: result.raw[index]?.distance_km
        ? parseFloat(result.raw[index].distance_km)
        : undefined,
    }));
  }
}
