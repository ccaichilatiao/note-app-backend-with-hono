import { z } from "zod";
import { sql } from "drizzle-orm";
import {
  pgTable,
  serial,
  text,
  timestamp,
  varchar,
  boolean,
} from "drizzle-orm/pg-core";

import { userSchema } from "./users.schema";
import { createInsertSchema, createSelectSchema } from "drizzle-zod";

export const notesSchema = pgTable("notes", {
  id: serial("id").primaryKey(),
  title: varchar("title", { length: 256 }).notNull(),
  content: varchar("content", { length: 256 }).notNull(),
  date: text("date").notNull(),
  isPinned: boolean("isPinned").notNull().default(false),
  tags: text("tags")
    .array()
    .notNull()
    .default(sql`'{}'::text[]`),

  userId: serial("userId")
    .notNull()
    .references(() => userSchema.id),

  createdAt: timestamp("createdAt").defaultNow(),
  updatedAt: timestamp("updatedAt").defaultNow(),
});

export const insertNoteSchema = createInsertSchema(notesSchema, {
  title: z.string({ required_error: "title is required" }),
  content: z.string({ required_error: "content is required" }),
  date: z.string({ required_error: "date is required" }),
  tags: z.array(z.string(), { required_error: "tags is required" }),
  userId: z.string({ required_error: "userId is required" }),
  isPinned: z.boolean().default(false),
});

export const selectNoteSchema = createSelectSchema(notesSchema);
