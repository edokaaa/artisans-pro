import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddIndexToEntities1769200962122 implements MigrationInterface {
  name = 'AddIndexToEntities1769200962122';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TYPE "public"."requested_services_rescheduledstatus_enum" AS ENUM('nan', 'requested', 'accepted', 'rejected')`,
    );
    await queryRunner.query(
      `ALTER TABLE "requested_services" ADD "rescheduledStatus" "public"."requested_services_rescheduledstatus_enum" NOT NULL DEFAULT 'nan'`,
    );
    await queryRunner.query(
      `ALTER TABLE "requested_services" ADD "city" character varying`,
    );
    await queryRunner.query(
      `ALTER TABLE "requested_services" ADD "state" character varying`,
    );
    await queryRunner.query(`ALTER TABLE "reviews" ADD "reply_id" uuid`);
    await queryRunner.query(
      `ALTER TABLE "reviews" ADD CONSTRAINT "UQ_66534255b87610bfb9b7b5f3a14" UNIQUE ("reply_id")`,
    );
    await queryRunner.query(
      `ALTER TABLE "service_providers" ADD "state" character varying`,
    );
    await queryRunner.query(
      `ALTER TABLE "service_providers" ADD "city" character varying`,
    );
    await queryRunner.query(
      `CREATE INDEX "idx_category_name" ON "service_categories" ("name") `,
    );
    await queryRunner.query(
      `CREATE INDEX "idx_category_slug" ON "service_categories" ("slug") `,
    );
    await queryRunner.query(
      `CREATE INDEX "idx_skill_name" ON "service_category_skills" ("name") `,
    );
    await queryRunner.query(
      `CREATE INDEX "idx_skill_slug" ON "service_category_skills" ("slug") `,
    );
    await queryRunner.query(
      `CREATE INDEX "idx_provider_state_city" ON "service_providers" ("state", "city") `,
    );
    await queryRunner.query(
      `CREATE INDEX "idx_provider_available_verified" ON "service_providers" ("available", "verificationStatus") `,
    );
    await queryRunner.query(
      `ALTER TABLE "reviews" ADD CONSTRAINT "FK_66534255b87610bfb9b7b5f3a14" FOREIGN KEY ("reply_id") REFERENCES "review_replies"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "reviews" DROP CONSTRAINT "FK_66534255b87610bfb9b7b5f3a14"`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."idx_provider_available_verified"`,
    );
    await queryRunner.query(`DROP INDEX "public"."idx_provider_state_city"`);
    await queryRunner.query(`DROP INDEX "public"."idx_skill_slug"`);
    await queryRunner.query(`DROP INDEX "public"."idx_skill_name"`);
    await queryRunner.query(`DROP INDEX "public"."idx_category_slug"`);
    await queryRunner.query(`DROP INDEX "public"."idx_category_name"`);
    await queryRunner.query(
      `ALTER TABLE "service_providers" DROP COLUMN "city"`,
    );
    await queryRunner.query(
      `ALTER TABLE "service_providers" DROP COLUMN "state"`,
    );
    await queryRunner.query(
      `ALTER TABLE "reviews" DROP CONSTRAINT "UQ_66534255b87610bfb9b7b5f3a14"`,
    );
    await queryRunner.query(`ALTER TABLE "reviews" DROP COLUMN "reply_id"`);
    await queryRunner.query(
      `ALTER TABLE "requested_services" DROP COLUMN "state"`,
    );
    await queryRunner.query(
      `ALTER TABLE "requested_services" DROP COLUMN "city"`,
    );
    await queryRunner.query(
      `ALTER TABLE "requested_services" DROP COLUMN "rescheduledStatus"`,
    );
    await queryRunner.query(
      `DROP TYPE "public"."requested_services_rescheduledstatus_enum"`,
    );
  }
}
