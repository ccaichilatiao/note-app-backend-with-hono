import {
  insertUserSchema,
  selectUserSchema,
} from "../../db/schema/users.schema";

export const createUserSchema = insertUserSchema.omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const fetchUserSchema = selectUserSchema.omit({
  id: true,
  name: true,
  createdAt: true,
  updatedAt: true,
});
