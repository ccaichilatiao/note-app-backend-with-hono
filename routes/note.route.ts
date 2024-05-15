import { Hono } from "hono";
import { isAuthenticated } from "../middlewares/auth";
import { db } from "../db";
import { notesSchema } from "../db/schema/notes.schema";
import { eq, and, sql, not, desc } from "drizzle-orm";
import { ZodVoid } from "zod";
import { createNoteSchema } from "./schema/note.schema";
import { zValidator } from "@hono/zod-validator";

export const noteRoute = new Hono()
  .get("/", isAuthenticated, async (c) => {
    const user = c.var.user;
    const notes = await db
      .select()
      .from(notesSchema)
      .where(eq(notesSchema.userId, user.id))
      .orderBy(desc(notesSchema.isPinned));

    return c.json({ status: true, notes: notes });
  })
  .get("/:id", async (c) => {
    return c.text("note");
  })
  .post(
    "/",
    zValidator("json", createNoteSchema),
    isAuthenticated,
    async (c) => {
      const user = c.var.user;
      const { title, content, date, tags } = c.req.valid("json");
      const note = await db
        .insert(notesSchema)
        .values({
          title,
          content,
          date,
          tags,
          userId: user.id,
          isPinned: false,
        })
        .returning();

      return c.json({ status: true, notes: note });
    }
  )
  .put(
    "/:id",
    zValidator("json", createNoteSchema),
    isAuthenticated,
    async (c) => {
      const user = c.var.user;
      const id = c.req.param("id") || "0";
      const idNumber = Number.parseInt(id);
      const { title, content, date, tags } = c.req.valid("json");
      const note = await db
        .update(notesSchema)
        .set({
          title,
          content,
          date,
          tags,
        })
        .where(
          and(eq(notesSchema.id, idNumber), eq(notesSchema.userId, user.id))
        )
        .returning();

      return c.json({ status: true, notes: note });
    }
  )
  .delete("/:id", isAuthenticated, async (c) => {
    const user = c.var.user;
    const id = c.req.param("id") || "0";
    const idNumber = Number.parseInt(id);
    const note = await db
      .delete(notesSchema)
      .where(and(eq(notesSchema.id, idNumber), eq(notesSchema.userId, user.id)))
      .returning();
    return c.json({ status: true, note: note }, { status: 204 });
  })
  .patch("/:id", isAuthenticated, async (c) => {
    const user = c.var.user;
    const id = c.req.param("id") || "0";
    const idNumber = Number.parseInt(id);
    await db
      .update(notesSchema)
      .set({
        isPinned: not(notesSchema.isPinned),
      })
      .where(
        and(eq(notesSchema.id, idNumber), eq(notesSchema.userId, user.id))
      );
    return c.json({ status: true }, { status: 200 });
  });
