import { MigrationInterface, QueryRunner } from 'typeorm';

export class GeoIndexes1768868652054 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE INDEX idx_profiles_location
      ON profiles USING GIST (location)
    `);

    await queryRunner.query(`
      CREATE INDEX idx_requested_services_location
      ON requested_services USING GIST (location)
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP INDEX IF EXISTS idx_profiles_location`);
    await queryRunner.query(`DROP INDEX IF EXISTS idx_requested_services_location`);
  }
}
