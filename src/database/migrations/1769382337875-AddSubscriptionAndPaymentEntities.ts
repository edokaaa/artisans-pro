import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddSubscriptionAndPaymentEntities1769382337875 implements MigrationInterface {
  name = 'AddSubscriptionAndPaymentEntities1769382337875';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE "subscription_plans" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "deletedAt" TIMESTAMP WITH TIME ZONE, "name" character varying NOT NULL, "description" text, "price" numeric(10,2) NOT NULL, "currency" character varying NOT NULL DEFAULT 'NGN', "durationInDays" integer NOT NULL DEFAULT '30', "isActive" boolean NOT NULL DEFAULT true, "features" jsonb, CONSTRAINT "UQ_ae18a0f6e0143f06474aa8cef1f" UNIQUE ("name"), CONSTRAINT "PK_9ab8fe6918451ab3d0a4fb6bb0c" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TYPE "public"."subscriptions_status_enum" AS ENUM('pending', 'active', 'expired', 'cancelled')`,
    );
    await queryRunner.query(
      `CREATE TABLE "subscriptions" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "deletedAt" TIMESTAMP WITH TIME ZONE, "status" "public"."subscriptions_status_enum" NOT NULL, "startsAt" TIMESTAMP WITH TIME ZONE, "endsAt" TIMESTAMP WITH TIME ZONE, "paymentSessionId" uuid, "service_provider_id" uuid, "subscription_plan_id" uuid, CONSTRAINT "UQ_886748ac5f3d478b75936f59c0c" UNIQUE ("paymentSessionId"), CONSTRAINT "PK_a87248d73155605cf782be9ee5e" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_2c47f5df06175daa620dab983a" ON "subscriptions" ("service_provider_id", "status") `,
    );
    await queryRunner.query(
      `CREATE TYPE "public"."payments_purpose_enum" AS ENUM('subscription', 'offer')`,
    );
    await queryRunner.query(
      `CREATE TYPE "public"."payments_status_enum" AS ENUM('pending', 'success', 'failed', 'reversed')`,
    );
    await queryRunner.query(
      `CREATE TABLE "payments" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "sessionId" uuid NOT NULL, "userId" character varying NOT NULL, "purpose" "public"."payments_purpose_enum" NOT NULL, "amount" numeric(10,2) NOT NULL, "status" "public"."payments_status_enum" NOT NULL, "reference" character varying, "payload" jsonb, CONSTRAINT "PK_197ab7af18c93fbb0c9b28b4a59" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE UNIQUE INDEX "IDX_c96a63d98681cc603f7300deeb" ON "payments" ("sessionId") `,
    );
    await queryRunner.query(
      `CREATE TYPE "public"."escrows_status_enum" AS ENUM('held', 'released', 'refunded')`,
    );
    await queryRunner.query(
      `CREATE TABLE "escrows" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "amount" numeric(10,2) NOT NULL, "status" "public"."escrows_status_enum" NOT NULL DEFAULT 'held', "releasedAt" TIMESTAMP WITH TIME ZONE, "offer_id" uuid, CONSTRAINT "REL_ab261fdd66300f0671f782bc8a" UNIQUE ("offer_id"), CONSTRAINT "PK_9cd10ae5b52350c3a20d124f5d3" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `ALTER TABLE "offers" ADD "escrowStatus" character varying`,
    );
    await queryRunner.query(
      `ALTER TABLE "offers" ADD "cancellationReason" character varying`,
    );
    await queryRunner.query(
      `ALTER TYPE "public"."offers_status_enum" RENAME TO "offers_status_enum_old"`,
    );
    await queryRunner.query(
      `CREATE TYPE "public"."offers_status_enum" AS ENUM('pending', 'accepted', 'declined', 'pending_payment', 'payment_made', 'completed', 'cancelled')`,
    );
    await queryRunner.query(
      `ALTER TABLE "offers" ALTER COLUMN "status" DROP DEFAULT`,
    );
    await queryRunner.query(
      `ALTER TABLE "offers" ALTER COLUMN "status" TYPE "public"."offers_status_enum" USING "status"::"text"::"public"."offers_status_enum"`,
    );
    await queryRunner.query(
      `ALTER TABLE "offers" ALTER COLUMN "status" SET DEFAULT 'pending'`,
    );
    await queryRunner.query(`DROP TYPE "public"."offers_status_enum_old"`);
    await queryRunner.query(
      `ALTER TABLE "subscriptions" ADD CONSTRAINT "FK_ef382f2b9db4047517d6de7df30" FOREIGN KEY ("service_provider_id") REFERENCES "service_providers"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "subscriptions" ADD CONSTRAINT "FK_a442b5ac4f7a8f51a64b2060c48" FOREIGN KEY ("subscription_plan_id") REFERENCES "subscription_plans"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "escrows" ADD CONSTRAINT "FK_ab261fdd66300f0671f782bc8a0" FOREIGN KEY ("offer_id") REFERENCES "offers"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "escrows" DROP CONSTRAINT "FK_ab261fdd66300f0671f782bc8a0"`,
    );
    await queryRunner.query(
      `ALTER TABLE "subscriptions" DROP CONSTRAINT "FK_a442b5ac4f7a8f51a64b2060c48"`,
    );
    await queryRunner.query(
      `ALTER TABLE "subscriptions" DROP CONSTRAINT "FK_ef382f2b9db4047517d6de7df30"`,
    );
    await queryRunner.query(
      `CREATE TYPE "public"."offers_status_enum_old" AS ENUM('pending', 'accepted', 'declined', 'pending_payment', 'payment_made')`,
    );
    await queryRunner.query(
      `ALTER TABLE "offers" ALTER COLUMN "status" DROP DEFAULT`,
    );
    await queryRunner.query(
      `ALTER TABLE "offers" ALTER COLUMN "status" TYPE "public"."offers_status_enum_old" USING "status"::"text"::"public"."offers_status_enum_old"`,
    );
    await queryRunner.query(
      `ALTER TABLE "offers" ALTER COLUMN "status" SET DEFAULT 'pending'`,
    );
    await queryRunner.query(`DROP TYPE "public"."offers_status_enum"`);
    await queryRunner.query(
      `ALTER TYPE "public"."offers_status_enum_old" RENAME TO "offers_status_enum"`,
    );
    await queryRunner.query(
      `ALTER TABLE "offers" DROP COLUMN "cancellationReason"`,
    );
    await queryRunner.query(`ALTER TABLE "offers" DROP COLUMN "escrowStatus"`);
    await queryRunner.query(`DROP TABLE "escrows"`);
    await queryRunner.query(`DROP TYPE "public"."escrows_status_enum"`);
    await queryRunner.query(
      `DROP INDEX "public"."IDX_c96a63d98681cc603f7300deeb"`,
    );
    await queryRunner.query(`DROP TABLE "payments"`);
    await queryRunner.query(`DROP TYPE "public"."payments_status_enum"`);
    await queryRunner.query(`DROP TYPE "public"."payments_purpose_enum"`);
    await queryRunner.query(
      `DROP INDEX "public"."IDX_2c47f5df06175daa620dab983a"`,
    );
    await queryRunner.query(`DROP TABLE "subscriptions"`);
    await queryRunner.query(`DROP TYPE "public"."subscriptions_status_enum"`);
    await queryRunner.query(`DROP TABLE "subscription_plans"`);
  }
}
