import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddCityAndStateToRequestedService1769079434219 implements MigrationInterface {
  name = 'AddCityAndStateToRequestedService1769079434219';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "requested_services" ADD "city" character varying`,
    );
    await queryRunner.query(
      `ALTER TABLE "requested_services" ADD "state" character varying`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "requested_services" DROP COLUMN "state"`,
    );
    await queryRunner.query(
      `ALTER TABLE "requested_services" DROP COLUMN "city"`,
    );
  }
}
