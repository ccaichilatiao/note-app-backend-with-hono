import { createMiddleware } from "hono/factory";
import { verify } from "hono/jwt";
import { eq } from "drizzle-orm";

import { db } from "../db";
import type { UserSchemaType } from "../db/schema/users.schema";
import { userSchema } from "../db/schema/users.schema";

type Env = {
  Variables: {
    user: UserSchemaType;
  };
};

export const isAuthenticated = createMiddleware<Env>(async (c, next) => {
  // const start = performance.now();
  // console.log("request coming...");
  const tokenString = c.req.header()["authorization"];
  if (!tokenString) {
    return c.json({ status: false, message: "unauthorized" }, 401);
  }
  const token = tokenString.split(" ")[1];
  const playload = await verify(token, process.env.SECRET!);
  if (!playload) {
    return c.json({ status: false, message: "token invalid" }, 401);
  }
  const user = await db
    .select({
      id: userSchema.id,
      name: userSchema.name,
      email: userSchema.email,
      createdAt: userSchema.createdAt,
      updatedAt: userSchema.updatedAt,
    })
    .from(userSchema)
    .where(eq(userSchema.id, playload.userId))
    .then((user) => user[0]);
  if (!user) {
    return c.json({ status: false, message: "user not found" }, 404);
  }
  c.set("user", user);
  await next();
  // const end = performance.now();
  // console.log(`request done in ${end - start}ms`);
});
