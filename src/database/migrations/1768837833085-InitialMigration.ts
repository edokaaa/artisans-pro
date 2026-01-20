import { MigrationInterface, QueryRunner } from 'typeorm';

export class InitialMigration1768837833085 implements MigrationInterface {
  name = 'InitialMigration1768837833085';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE "users" ("id" character varying NOT NULL, "email" character varying NOT NULL, "firstName" character varying NOT NULL, "lastName" character varying NOT NULL, "lastSyncedAt" TIMESTAMP WITH TIME ZONE NOT NULL, CONSTRAINT "UQ_97672ac88f789774dd47f7c8be3" UNIQUE ("email"), CONSTRAINT "PK_a3ffb1c0c8416b9fc6f907b7433" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "profiles" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "location" geography(Point,4326), "name" character varying NOT NULL, "user_id" character varying, CONSTRAINT "REL_9e432b7df0d182f8d292902d1a" UNIQUE ("user_id"), CONSTRAINT "PK_8e520eb4da7dc01d0e190447c8e" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "service_categories" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "name" character varying NOT NULL, "slug" character varying NOT NULL, "iconUrl" character varying, CONSTRAINT "UQ_7ef2e28b495d09a4eb28997c653" UNIQUE ("name"), CONSTRAINT "UQ_88a33271b3d94a0c4bc14db3b76" UNIQUE ("slug"), CONSTRAINT "PK_fe4da5476c4ffe5aa2d3524ae68" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "service_category_skills" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "name" character varying NOT NULL, "slug" character varying NOT NULL, "service_category_id" uuid, CONSTRAINT "UQ_3777e7e34f175b548d1f1357642" UNIQUE ("slug"), CONSTRAINT "PK_4c97be712d213ece0c4ac9ef0ee" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TYPE "public"."service_providers_idtype_enum" AS ENUM('national_id', 'passport', 'drivers_license')`,
    );
    await queryRunner.query(
      `CREATE TYPE "public"."service_providers_verificationstatus_enum" AS ENUM('pending', 'verified', 'failed')`,
    );
    await queryRunner.query(
      `CREATE TABLE "service_providers" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "deletedAt" TIMESTAMP WITH TIME ZONE, "fullName" character varying NOT NULL, "title" character varying, "bio" character varying, "companyName" character varying, "workPhotoUrls" text array NOT NULL, "idType" "public"."service_providers_idtype_enum" NOT NULL, "idNumber" character varying NOT NULL, "idPhotoFrontUrl" character varying NOT NULL, "idPhotoBackUrl" character varying, "selfieUrl" character varying NOT NULL, "verificationStatus" "public"."service_providers_verificationstatus_enum" NOT NULL DEFAULT 'pending', "verificationFailureReason" character varying, "available" boolean NOT NULL DEFAULT true, "phoneNumber" character varying NOT NULL, "phoneNumberVerified" boolean NOT NULL DEFAULT false, "profile_id" uuid, CONSTRAINT "REL_4e7a5d046f361d1a148b9ce5fe" UNIQUE ("profile_id"), CONSTRAINT "PK_73c86f1298c5285d76e66da2da9" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "clients" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "fullName" character varying NOT NULL, "profile_id" uuid, CONSTRAINT "REL_826d0742803aba8b2bcfd32c1c" UNIQUE ("profile_id"), CONSTRAINT "PK_f1ab7cf3a5714dbc6bb4e1c28a4" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "service_provider_jobs" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "deletedAt" TIMESTAMP WITH TIME ZONE, "name" character varying NOT NULL, "price" numeric(10,2) NOT NULL, "description" text NOT NULL, "usesEscrow" boolean NOT NULL DEFAULT false, "isActive" boolean NOT NULL DEFAULT false, "service_provider_id" uuid, "service_category_skill_id" uuid, CONSTRAINT "PK_9a0bf21e516f1cde1b1d8fc57e6" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TYPE "public"."requested_services_status_enum" AS ENUM('pending', 'accepted', 'rejected', 'on-going', 'canceled', 'payment_pending', 'completed')`,
    );
    await queryRunner.query(
      `CREATE TABLE "requested_services" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "location" geography(Point,4326), "description" text NOT NULL, "isInstant" boolean NOT NULL DEFAULT false, "date" TIMESTAMP WITH TIME ZONE NOT NULL, "isRescheduled" boolean NOT NULL DEFAULT false, "rescheduledDate" TIMESTAMP WITH TIME ZONE, "rescheduledReason" character varying, "status" "public"."requested_services_status_enum" NOT NULL DEFAULT 'pending', "cancellationReason" character varying, "service_provider_job_id" uuid, "client_id" uuid, CONSTRAINT "PK_ef81e998e9c5abaea74085a0aa4" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TYPE "public"."reviews_stars_enum" AS ENUM('1', '2', '3', '4', '5')`,
    );
    await queryRunner.query(
      `CREATE TABLE "reviews" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "deletedAt" TIMESTAMP WITH TIME ZONE, "stars" "public"."reviews_stars_enum" NOT NULL, "comment" text NOT NULL, "chargedMore" boolean NOT NULL, "timely" boolean NOT NULL, "wasProfessional" boolean NOT NULL, "wasSuspicious" boolean NOT NULL, "client_id" uuid, "service_provider_id" uuid, "requested_service_id" uuid, CONSTRAINT "REL_d04da5c840cfcf2aeed153b576" UNIQUE ("requested_service_id"), CONSTRAINT "PK_231ae565c273ee700b283f15c1d" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "review_replies" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "comment" text NOT NULL, "review_id" uuid, CONSTRAINT "REL_4b343f41daa49ce42b5b07d77e" UNIQUE ("review_id"), CONSTRAINT "PK_ba79cc5b487adc14fc3fe8b484d" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "reports" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "deletedAt" TIMESTAMP WITH TIME ZONE, "comment" character varying, "client_id" uuid, "service_provider_id" uuid, CONSTRAINT "PK_d9013193989303580053c0b5ef6" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TYPE "public"."offers_status_enum" AS ENUM('pending', 'accepted', 'declined', 'pending_payment', 'payment_made')`,
    );
    await queryRunner.query(
      `CREATE TABLE "offers" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "deletedAt" TIMESTAMP WITH TIME ZONE, "title" character varying NOT NULL, "amount" numeric(10,2) NOT NULL, "taskDescription" text NOT NULL, "useEscrow" boolean NOT NULL DEFAULT false, "status" "public"."offers_status_enum" NOT NULL DEFAULT 'pending', "client_id" uuid, "service_provider_id" uuid, CONSTRAINT "PK_4c88e956195bba85977da21b8f4" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "service_provider_skills" ("service_provider_id" uuid NOT NULL, "service_category_skill_id" uuid NOT NULL, CONSTRAINT "PK_b59c9b02c480a82d98f79851b7b" PRIMARY KEY ("service_provider_id", "service_category_skill_id"))`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_064ec70fe7a185d0a63c3c8221" ON "service_provider_skills" ("service_provider_id") `,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_2ea1d746330b98b84b766da847" ON "service_provider_skills" ("service_category_skill_id") `,
    );
    await queryRunner.query(
      `ALTER TABLE "profiles" ADD CONSTRAINT "FK_9e432b7df0d182f8d292902d1a2" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "service_category_skills" ADD CONSTRAINT "FK_b85ac3c34b9d49666e70aeb9b38" FOREIGN KEY ("service_category_id") REFERENCES "service_categories"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "service_providers" ADD CONSTRAINT "FK_4e7a5d046f361d1a148b9ce5fe8" FOREIGN KEY ("profile_id") REFERENCES "profiles"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "clients" ADD CONSTRAINT "FK_826d0742803aba8b2bcfd32c1c3" FOREIGN KEY ("profile_id") REFERENCES "profiles"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "service_provider_jobs" ADD CONSTRAINT "FK_e22ce0c4a93a1275402ab19ebb7" FOREIGN KEY ("service_provider_id") REFERENCES "service_providers"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "service_provider_jobs" ADD CONSTRAINT "FK_5ad9e14e5a68bf11f9e52501cde" FOREIGN KEY ("service_category_skill_id") REFERENCES "service_category_skills"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "requested_services" ADD CONSTRAINT "FK_d56f10ec99e6917468681e6beb4" FOREIGN KEY ("service_provider_job_id") REFERENCES "service_provider_jobs"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "requested_services" ADD CONSTRAINT "FK_bf4f130ae9a673133ed3bb865b4" FOREIGN KEY ("client_id") REFERENCES "clients"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "reviews" ADD CONSTRAINT "FK_d4e7e923e6bb78a8f0add754493" FOREIGN KEY ("client_id") REFERENCES "clients"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "reviews" ADD CONSTRAINT "FK_005bd60144bfe6c2be146681f59" FOREIGN KEY ("service_provider_id") REFERENCES "service_providers"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "reviews" ADD CONSTRAINT "FK_d04da5c840cfcf2aeed153b576f" FOREIGN KEY ("requested_service_id") REFERENCES "requested_services"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "review_replies" ADD CONSTRAINT "FK_4b343f41daa49ce42b5b07d77e3" FOREIGN KEY ("review_id") REFERENCES "reviews"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "reports" ADD CONSTRAINT "FK_bda44e16992191ff11ad8da01e2" FOREIGN KEY ("client_id") REFERENCES "clients"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "reports" ADD CONSTRAINT "FK_2ce65e1ecb3ff639d34b07a97b2" FOREIGN KEY ("service_provider_id") REFERENCES "service_providers"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "offers" ADD CONSTRAINT "FK_197c0a68e7feaa3af0559d8b2d4" FOREIGN KEY ("client_id") REFERENCES "clients"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "offers" ADD CONSTRAINT "FK_ac4799bcc94e852d5f782ea9c5f" FOREIGN KEY ("service_provider_id") REFERENCES "service_providers"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "service_provider_skills" ADD CONSTRAINT "FK_064ec70fe7a185d0a63c3c82212" FOREIGN KEY ("service_provider_id") REFERENCES "service_providers"("id") ON DELETE CASCADE ON UPDATE CASCADE`,
    );
    await queryRunner.query(
      `ALTER TABLE "service_provider_skills" ADD CONSTRAINT "FK_2ea1d746330b98b84b766da847c" FOREIGN KEY ("service_category_skill_id") REFERENCES "service_category_skills"("id") ON DELETE CASCADE ON UPDATE CASCADE`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "service_provider_skills" DROP CONSTRAINT "FK_2ea1d746330b98b84b766da847c"`,
    );
    await queryRunner.query(
      `ALTER TABLE "service_provider_skills" DROP CONSTRAINT "FK_064ec70fe7a185d0a63c3c82212"`,
    );
    await queryRunner.query(
      `ALTER TABLE "offers" DROP CONSTRAINT "FK_ac4799bcc94e852d5f782ea9c5f"`,
    );
    await queryRunner.query(
      `ALTER TABLE "offers" DROP CONSTRAINT "FK_197c0a68e7feaa3af0559d8b2d4"`,
    );
    await queryRunner.query(
      `ALTER TABLE "reports" DROP CONSTRAINT "FK_2ce65e1ecb3ff639d34b07a97b2"`,
    );
    await queryRunner.query(
      `ALTER TABLE "reports" DROP CONSTRAINT "FK_bda44e16992191ff11ad8da01e2"`,
    );
    await queryRunner.query(
      `ALTER TABLE "review_replies" DROP CONSTRAINT "FK_4b343f41daa49ce42b5b07d77e3"`,
    );
    await queryRunner.query(
      `ALTER TABLE "reviews" DROP CONSTRAINT "FK_d04da5c840cfcf2aeed153b576f"`,
    );
    await queryRunner.query(
      `ALTER TABLE "reviews" DROP CONSTRAINT "FK_005bd60144bfe6c2be146681f59"`,
    );
    await queryRunner.query(
      `ALTER TABLE "reviews" DROP CONSTRAINT "FK_d4e7e923e6bb78a8f0add754493"`,
    );
    await queryRunner.query(
      `ALTER TABLE "requested_services" DROP CONSTRAINT "FK_bf4f130ae9a673133ed3bb865b4"`,
    );
    await queryRunner.query(
      `ALTER TABLE "requested_services" DROP CONSTRAINT "FK_d56f10ec99e6917468681e6beb4"`,
    );
    await queryRunner.query(
      `ALTER TABLE "service_provider_jobs" DROP CONSTRAINT "FK_5ad9e14e5a68bf11f9e52501cde"`,
    );
    await queryRunner.query(
      `ALTER TABLE "service_provider_jobs" DROP CONSTRAINT "FK_e22ce0c4a93a1275402ab19ebb7"`,
    );
    await queryRunner.query(
      `ALTER TABLE "clients" DROP CONSTRAINT "FK_826d0742803aba8b2bcfd32c1c3"`,
    );
    await queryRunner.query(
      `ALTER TABLE "service_providers" DROP CONSTRAINT "FK_4e7a5d046f361d1a148b9ce5fe8"`,
    );
    await queryRunner.query(
      `ALTER TABLE "service_category_skills" DROP CONSTRAINT "FK_b85ac3c34b9d49666e70aeb9b38"`,
    );
    await queryRunner.query(
      `ALTER TABLE "profiles" DROP CONSTRAINT "FK_9e432b7df0d182f8d292902d1a2"`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_2ea1d746330b98b84b766da847"`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_064ec70fe7a185d0a63c3c8221"`,
    );
    await queryRunner.query(`DROP TABLE "service_provider_skills"`);
    await queryRunner.query(`DROP TABLE "offers"`);
    await queryRunner.query(`DROP TYPE "public"."offers_status_enum"`);
    await queryRunner.query(`DROP TABLE "reports"`);
    await queryRunner.query(`DROP TABLE "review_replies"`);
    await queryRunner.query(`DROP TABLE "reviews"`);
    await queryRunner.query(`DROP TYPE "public"."reviews_stars_enum"`);
    await queryRunner.query(`DROP TABLE "requested_services"`);
    await queryRunner.query(
      `DROP TYPE "public"."requested_services_status_enum"`,
    );
    await queryRunner.query(`DROP TABLE "service_provider_jobs"`);
    await queryRunner.query(`DROP TABLE "clients"`);
    await queryRunner.query(`DROP TABLE "service_providers"`);
    await queryRunner.query(
      `DROP TYPE "public"."service_providers_verificationstatus_enum"`,
    );
    await queryRunner.query(
      `DROP TYPE "public"."service_providers_idtype_enum"`,
    );
    await queryRunner.query(`DROP TABLE "service_category_skills"`);
    await queryRunner.query(`DROP TABLE "service_categories"`);
    await queryRunner.query(`DROP TABLE "profiles"`);
    await queryRunner.query(`DROP TABLE "users"`);
  }
}
