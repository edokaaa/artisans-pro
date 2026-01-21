import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddReplyIdToReview1768994208451 implements MigrationInterface {
  name = 'AddReplyIdToReview1768994208451';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "reviews" ADD "reply_id" uuid`);
    await queryRunner.query(
      `ALTER TABLE "reviews" ADD CONSTRAINT "UQ_66534255b87610bfb9b7b5f3a14" UNIQUE ("reply_id")`,
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
      `ALTER TABLE "reviews" DROP CONSTRAINT "UQ_66534255b87610bfb9b7b5f3a14"`,
    );
    await queryRunner.query(`ALTER TABLE "reviews" DROP COLUMN "reply_id"`);
  }
}
