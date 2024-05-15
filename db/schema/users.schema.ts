import { z } from "zod";
import { pgTable, serial, varchar, timestamp, text } from "drizzle-orm/pg-core";
import { createInsertSchema, createSelectSchema } from "drizzle-zod";

export const userSchema = pgTable("users", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 256 }).notNull(),
  email: varchar("email", { length: 256 }).notNull(),
  password: varchar("password", { length: 256 }).notNull(),
  createdAt: timestamp("createdAt").defaultNow(),
  updatedAt: timestamp("updatedAt").defaultNow(),
});

export const insertUserSchema = createInsertSchema(userSchema, {
  name: z.string({ required_error: "name is required" }),
  email: z
    .string({ required_error: "email is required" })
    .regex(
      /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/,
      "email is invalid"
    ),
  password: z.string({ required_error: "password is required" }),
});

export const selectUserSchema = createSelectSchema(userSchema);

export interface UserSchemaType {
  id: number;
  name: string;
  email: string;
  createdAt: Date | null;
  updatedAt: Date | null;
}
