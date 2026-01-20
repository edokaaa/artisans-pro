import { DataSource } from 'typeorm';
import { ServiceCategory } from 'src/categories/entities/service-category.entity';
import { ServiceCategorySkill } from 'src/categories/entities/service-category-skill.entity';
import { slugify } from 'src/common/utils/slugify';

export async function seedServiceCategories(
  dataSource: DataSource,
): Promise<void> {
  const categoryRepo = dataSource.getRepository(ServiceCategory);
  const skillRepo = dataSource.getRepository(ServiceCategorySkill);

  const categories = [
    {
      name: 'AC Repair',
      skills: ['Installation', 'Servicing', 'Repair'],
      iconUrl:
        'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcR18uA6C5xaQGFUaVpEKQIeXmp3NzELx9x0XA&s',
    },
    {
      name: 'Cooking',
      skills: ['Intercontinental Dishes', 'Local Dishes', 'Pastery'],
      iconUrl: 'https://imgur.com/download/koWDzBs/',
    },
  ];

  for (const categoryData of categories) {
    const categorySlug = slugify(categoryData.name);

    let category = await categoryRepo.findOne({
      where: { slug: categorySlug },
      relations: ['skills'],
    });

    if (!category) {
      category = categoryRepo.create({
        name: categoryData.name,
        slug: categorySlug,
        iconUrl: categoryData.iconUrl,
      });

      category = await categoryRepo.save(category);
    }

    for (const skillName of categoryData.skills) {
      const skillSlug = slugify(skillName);

      const existingSkill = await skillRepo.findOne({
        where: {
          slug: skillSlug,
          category: { id: category.id },
        },
        relations: ['category'],
      });

      if (!existingSkill) {
        const skill = skillRepo.create({
          name: skillName,
          slug: skillSlug,
          category: category,
        });

        await skillRepo.save(skill);
      }
    }
  }

  console.log('Service categories & skills seeded');
}
