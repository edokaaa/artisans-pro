import { MigrationInterface, QueryRunner } from "typeorm";

export class AddStateAndCityToServiceProvider1768898074784 implements MigrationInterface {
    name = 'AddStateAndCityToServiceProvider1768898074784'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "service_providers" ADD "state" character varying`);
        await queryRunner.query(`ALTER TABLE "service_providers" ADD "city" character varying`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "service_providers" DROP COLUMN "city"`);
        await queryRunner.query(`ALTER TABLE "service_providers" DROP COLUMN "state"`);
    }

}
