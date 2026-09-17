import { Migration } from '@mikro-orm/migrations';

export class Migration20260917224750_game_commerce_licensing extends Migration {

	override name = 'Migration20260917224750_game_commerce_licensing';

	override up(): void | Promise<void> {
		this.addSql(`alter table "classroom_game" drop constraint "classroom_game_contract_game_version_id_foreign";`);
		this.addSql(`alter table "game_license" drop constraint "game_license_game_version_id_foreign";`);

		this.addSql(`create table "game_variant" ("id" uuid not null default gen_random_uuid(), "game_version_id" uuid not null, "language" varchar(255) not null, "mode" varchar(255) not null, "runtime_configuration" jsonb not null, "created_at" timestamptz not null, primary key ("id"));`);
		this.addSql(`alter table "game_variant" add constraint "game_variant_game_version_id_language_mode_unique" unique ("game_version_id", "language", "mode");`);
		this.addSql(`insert into "game_variant" ("game_version_id", "language", "mode", "runtime_configuration", "created_at") select "id", 'en', 'default', '{}', now() from "game_version";`);

		this.addSql(`create table "game_product" ("id" uuid not null default gen_random_uuid(), "game_variant_id" uuid not null, "price_minor_unit_amount" int not null, "price_currency" text not null, "is_available" boolean not null default true, "created_at" timestamptz not null, "published_at" timestamptz null, primary key ("id"));`);
		this.addSql(`insert into "game_product" ("game_variant_id", "price_minor_unit_amount", "price_currency", "is_available", "created_at", "published_at") select "variant"."id", "version"."price_minor_unit_amount", "version"."price_currency", true, now(), "version"."published_at" from "game_version" "version" inner join "game_variant" "variant" on "variant"."game_version_id" = "version"."id";`);

		this.addSql(`create table "institution_contract_game_product" ("id" uuid not null default gen_random_uuid(), "contract_id" uuid not null, "game_product_id" uuid not null, "allocated_license_quantity" int null, "license_duration_days" int not null, primary key ("id"));`);
		this.addSql(`alter table "institution_contract_game_product" add constraint "institution_contract_game_product_contract_id_gam_19404_unique" unique ("contract_id", "game_product_id");`);
		this.addSql(`insert into "institution_contract_game_product" ("contract_id", "game_product_id", "license_duration_days") select "legacy"."contract_id", "product"."id", "legacy"."license_duration_days" from "institution_contract_game_version" "legacy" inner join "game_variant" "variant" on "variant"."game_version_id" = "legacy"."game_version_id" inner join "game_product" "product" on "product"."game_variant_id" = "variant"."id";`);

		this.addSql(`create table "game_acquisition" ("id" uuid not null default gen_random_uuid(), "user_id" uuid not null, "product_id" uuid not null, "license_id" uuid not null, "mechanism" varchar(255) not null, "price_minor_unit_amount" int not null, "price_currency" text not null, "created_at" timestamptz not null, primary key ("id"));`);

		this.addSql(`update "classroom_game" "classroom" set "contract_game_version_id" = "contract_product"."id" from "institution_contract_game_product" "contract_product" inner join "institution_contract_game_version" "legacy" on "legacy"."contract_id" = "contract_product"."contract_id" inner join "game_variant" "variant" on "variant"."game_version_id" = "legacy"."game_version_id" inner join "game_product" "product" on "product"."id" = "contract_product"."game_product_id" and "product"."game_variant_id" = "variant"."id" where "classroom"."contract_game_version_id" = "legacy"."id";`);
		this.addSql(`delete from "game_license" where not exists (select 1 from "game_variant" where "game_variant"."game_version_id" = "game_license"."game_version_id");`);
		this.addSql(`update "game_license" "license" set "game_version_id" = "variant"."id" from "game_variant" "variant" where "variant"."game_version_id" = "license"."game_version_id";`);

		this.addSql(`drop table if exists "institution_contract_game_version" cascade;`);

		this.addSql(`alter table "game_version" drop constraint "game_version_price_currency_check";`);
		this.addSql(`alter table "game_version" drop column "price_minor_unit_amount", drop column "price_currency";`);

		this.addSql(`alter table "classroom_game" rename column "contract_game_version_id" to "contract_game_product_id";`);
		this.addSql(`alter table "classroom_game" add constraint "classroom_game_contract_game_product_id_foreign" foreign key ("contract_game_product_id") references "institution_contract_game_product" ("id") on delete restrict;`);

		this.addSql(`alter table "game_license" rename column "game_version_id" to "game_variant_id";`);
		this.addSql(`alter table "game_license" add constraint "game_license_game_variant_id_foreign" foreign key ("game_variant_id") references "game_variant" ("id") on delete restrict;`);

		this.addSql(`alter table "game_variant" add constraint "game_variant_game_version_id_foreign" foreign key ("game_version_id") references "game_version" ("id") on delete cascade;`);

		this.addSql(`alter table "game_product" add constraint "game_product_game_variant_id_foreign" foreign key ("game_variant_id") references "game_variant" ("id") on delete restrict;`);
		this.addSql(`alter table "game_product" add constraint "game_product_price_currency_check" check ("price_currency" in ('USD'));`);

		this.addSql(`alter table "institution_contract_game_product" add constraint "institution_contract_game_product_contract_id_foreign" foreign key ("contract_id") references "institution_contract" ("id") on delete cascade;`);
		this.addSql(`alter table "institution_contract_game_product" add constraint "institution_contract_game_product_game_product_id_foreign" foreign key ("game_product_id") references "game_product" ("id") on delete restrict;`);

		this.addSql(`alter table "game_acquisition" add constraint "game_acquisition_user_id_foreign" foreign key ("user_id") references "user_account" ("id") on delete restrict;`);
		this.addSql(`alter table "game_acquisition" add constraint "game_acquisition_product_id_foreign" foreign key ("product_id") references "game_product" ("id") on delete restrict;`);
		this.addSql(`alter table "game_acquisition" add constraint "game_acquisition_license_id_foreign" foreign key ("license_id") references "game_license" ("id") on delete restrict;`);
		this.addSql(`alter table "game_acquisition" add constraint "game_acquisition_price_currency_check" check ("price_currency" in ('USD'));`);
	}

	override down(): void | Promise<void> {
		this.addSql(`alter table "game_product" drop constraint "game_product_game_variant_id_foreign";`);
		this.addSql(`alter table "game_license" drop constraint "game_license_game_variant_id_foreign";`);
		this.addSql(`alter table "institution_contract_game_product" drop constraint "institution_contract_game_product_game_product_id_foreign";`);
		this.addSql(`alter table "game_acquisition" drop constraint "game_acquisition_product_id_foreign";`);
		this.addSql(`alter table "classroom_game" drop constraint "classroom_game_contract_game_product_id_foreign";`);

		this.addSql(`create table "institution_contract_game_version" ("id" uuid not null default gen_random_uuid(), "contract_id" uuid not null, "game_version_id" uuid not null, "price_minor_unit_amount" int4 not null, "price_currency" text not null, "license_duration_days" int4 not null, primary key ("id"));`);
		this.addSql(`alter table "institution_contract_game_version" add constraint "institution_contract_game_version_contract_id_gam_6e77d_unique" unique ("contract_id", "game_version_id");`);

		this.addSql(`drop table if exists "game_variant" cascade;`);
		this.addSql(`drop table if exists "game_product" cascade;`);
		this.addSql(`drop table if exists "institution_contract_game_product" cascade;`);
		this.addSql(`drop table if exists "game_acquisition" cascade;`);

		this.addSql(`alter table "classroom_game" rename column "contract_game_product_id" to "contract_game_version_id";`);
		this.addSql(`alter table "classroom_game" add constraint "classroom_game_contract_game_version_id_foreign" foreign key ("contract_game_version_id") references "institution_contract_game_version" ("id") on update no action on delete restrict;`);

		this.addSql(`alter table "game_license" rename column "game_variant_id" to "game_version_id";`);
		this.addSql(`alter table "game_license" add constraint "game_license_game_version_id_foreign" foreign key ("game_version_id") references "game_version" ("id") on update no action on delete restrict;`);

		this.addSql(`alter table "game_version" add "price_minor_unit_amount" int4 not null, add "price_currency" text not null;`);
		this.addSql(`alter table "game_version" add constraint "game_version_price_currency_check" check ("price_currency" in ('USD'));`);

		this.addSql(`alter table "institution_contract_game_version" add constraint "institution_contract_game_version_contract_id_foreign" foreign key ("contract_id") references "institution_contract" ("id") on update no action on delete cascade;`);
		this.addSql(`alter table "institution_contract_game_version" add constraint "institution_contract_game_version_game_version_id_foreign" foreign key ("game_version_id") references "game_version" ("id") on update no action on delete cascade;`);
		this.addSql(`alter table "institution_contract_game_version" add constraint "institution_contract_game_version_price_currency_check" check ("price_currency" in ('USD'));`);
	}

}
