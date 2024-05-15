import { insertNoteSchema } from "../../db/schema/notes.schema";

export const createNoteSchema = insertNoteSchema.omit({
  id: true,
  isPinned: true,
  userId: true,
  createdAt: true,
  updatedAt: true,
});
