CREATE TABLE "store_owners" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"mobile" varchar(20) NOT NULL,
	"mpin_hash" varchar(128) NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "store_owners_mobile_unique" UNIQUE("mobile")
);
--> statement-breakpoint
ALTER TABLE "stores" ADD COLUMN "owner_id" uuid;--> statement-breakpoint
ALTER TABLE "stores" ADD CONSTRAINT "stores_owner_id_store_owners_id_fk" FOREIGN KEY ("owner_id") REFERENCES "public"."store_owners"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "stores_owner_id_idx" ON "stores" USING btree ("owner_id");