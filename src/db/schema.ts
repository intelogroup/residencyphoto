import { index, integer, pgTable, text, timestamp, uuid } from "drizzle-orm/pg-core";

export const applicantProfiles = pgTable("applicant_profiles", {
  userId: text("user_id").primaryKey(),
  plan: text("plan", { enum: ["Free", "Resident", "Program"] }).notNull().default("Free"),
  downloadCount: integer("download_count").notNull().default(0),
  stripeCustomerId: text("stripe_customer_id").unique(),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
});

export const photoRecords = pgTable(
  "photo_records",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    userId: text("user_id").notNull(),
    originalFileName: text("original_file_name").notNull(),
    outputFileName: text("output_file_name"),
    outputSizeKb: integer("output_size_kb"),
    status: text("status", { enum: ["uploaded", "processing", "ready", "failed"] })
      .notNull()
      .default("uploaded"),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [index("photo_records_user_created_idx").on(table.userId, table.createdAt)],
);

export type ApplicantProfile = typeof applicantProfiles.$inferSelect;
export type NewApplicantProfile = typeof applicantProfiles.$inferInsert;
export type PhotoRecord = typeof photoRecords.$inferSelect;
export type NewPhotoRecord = typeof photoRecords.$inferInsert;
