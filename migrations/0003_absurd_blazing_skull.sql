ALTER TABLE "stores" ADD COLUMN "template_id" varchar(64);--> statement-breakpoint
ALTER TABLE "stores" ADD COLUMN "page_config" jsonb;