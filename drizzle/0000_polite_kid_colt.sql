CREATE TABLE "applicant_profiles" (
	"user_id" text PRIMARY KEY NOT NULL,
	"plan" text DEFAULT 'Free' NOT NULL,
	"stripe_customer_id" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "applicant_profiles_stripe_customer_id_unique" UNIQUE("stripe_customer_id")
);
--> statement-breakpoint
CREATE TABLE "photo_records" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" text NOT NULL,
	"original_file_name" text NOT NULL,
	"output_file_name" text,
	"output_size_kb" integer,
	"status" text DEFAULT 'uploaded' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE INDEX "photo_records_user_created_idx" ON "photo_records" USING btree ("user_id","created_at");