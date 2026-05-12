import { pgTable, text, serial } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const emergencyContactsTable = pgTable("emergency_contacts", {
  id: serial("id").primaryKey(),
  department: text("department").notNull(),
  contactNumber: text("contact_number").notNull(),
  city: text("city").notNull(),
  contactType: text("contact_type").notNull(),
});

export const insertEmergencyContactSchema = createInsertSchema(emergencyContactsTable).omit({ id: true });
export type InsertEmergencyContact = z.infer<typeof insertEmergencyContactSchema>;
export type EmergencyContact = typeof emergencyContactsTable.$inferSelect;
