import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddRescheduledStatusToRequestedService1769086187042 implements MigrationInterface {
  name = 'AddRescheduledStatusToRequestedService1769086187042';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "requested_services" DROP COLUMN "rescheduledstatus"`,
    );
    await queryRunner.query(
      `CREATE TYPE "public"."requested_services_rescheduledstatus_enum" AS ENUM('nan', 'requested', 'accepted', 'rejected')`,
    );
    await queryRunner.query(
      `ALTER TABLE "requested_services" ADD "rescheduledstatus" "public"."requested_services_rescheduledstatus_enum" NOT NULL DEFAULT 'nan'`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "requested_services" DROP COLUMN "rescheduledstatus"`,
    );
    await queryRunner.query(
      `DROP TYPE "public"."requested_services_rescheduledstatus_enum"`,
    );
    await queryRunner.query(
      `ALTER TABLE "requested_services" ADD "rescheduledstatus" character varying`,
    );
  }
}
