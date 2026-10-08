ALTER TABLE "inquiries" ADD COLUMN "email_status" text DEFAULT 'pending' NOT NULL;--> statement-breakpoint
ALTER TABLE "inquiries" ADD COLUMN "email_error" text DEFAULT '' NOT NULL;