import 'reflect-metadata';
import dataSource from './data-source';
import { seedServiceCategories } from './seeders/service-categoris.seeder';

async function runSeeds() {
  await dataSource.initialize();

  try {
    await seedServiceCategories(dataSource);
  } catch (error) {
    console.error('Seeding failed', error);
  } finally {
    await dataSource.destroy();
  }
}

runSeeds();
