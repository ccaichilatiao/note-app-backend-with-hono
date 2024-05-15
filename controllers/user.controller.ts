import type { Context } from "hono";
export const login = async (c: Context) => {
  return c.text("login");
};
