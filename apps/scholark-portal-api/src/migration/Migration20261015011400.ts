import { Migration } from '@mikro-orm/migrations';

export class Migration20261015011400 extends Migration {

	override async up(): Promise<void> {
		this.addSql('create table "instructor_user" ("id" uuid not null default gen_random_uuid(), "user_id" uuid not null, "instructor_id" uuid not null, "created_at" timestamptz not null, primary key ("id"));');
		this.addSql('alter table "instructor_user" add constraint "instructor_user_user_id_unique" unique ("user_id");');
		this.addSql('alter table "instructor_user" add constraint "instructor_user_instructor_id_unique" unique ("instructor_id");');
		this.addSql('create table "instructor_invitation" ("id" uuid not null default gen_random_uuid(), "instructor_id" uuid not null, "invited_by_id" uuid not null, "email" varchar(255) not null, "token_hash" varchar(255) not null, "expires_at" timestamptz not null, "accepted_at" timestamptz null, "revoked_at" timestamptz null, "created_at" timestamptz not null, primary key ("id"));');
		this.addSql('alter table "instructor_invitation" add constraint "instructor_invitation_token_hash_unique" unique ("token_hash");');
		this.addSql('alter table "instructor_user" add constraint "instructor_user_user_id_foreign" foreign key ("user_id") references "user_account" ("id");');
		this.addSql('alter table "instructor_user" add constraint "instructor_user_instructor_id_foreign" foreign key ("instructor_id") references "instructor" ("id");');
		this.addSql('alter table "instructor_invitation" add constraint "instructor_invitation_instructor_id_foreign" foreign key ("instructor_id") references "instructor" ("id") on delete cascade;');
		this.addSql('alter table "instructor_invitation" add constraint "instructor_invitation_invited_by_id_foreign" foreign key ("invited_by_id") references "user_account" ("id") on delete restrict;');
	}

	override async down(): Promise<void> {
		this.addSql('drop table if exists "instructor_invitation";');
		this.addSql('drop table if exists "instructor_user";');
	}

}