import { Hono } from "hono";
import { sign } from "hono/jwt";
import { eq } from "drizzle-orm";
import { zValidator } from "@hono/zod-validator";

import { db } from "../db";
import { isAuthenticated } from "../middlewares/auth";
import { createUserSchema, fetchUserSchema } from "./schema/user.schema";
import { userSchema } from "../db/schema/users.schema";

// use kinde auth tool to oauth
// export const userRoute = new Hono()
//   .get("/callback", async (c) => {
//     const url = new URL(c.req.url);
//     await kindeClient.handleRedirectToApp(sessionManagerWithCookies(c), url);
//     return c.redirect("/");
//   })
//   .post("/login", async (c) => {
//     const loginUrl = await kindeClient.login(sessionManagerWithCookies(c));
//     return c.redirect(loginUrl.toString());
//   })
//   .post("/register", async (c) => {
//     const registerUrl = await kindeClient.register(
//       sessionManagerWithCookies(c)
//     );
//     return c.redirect(registerUrl.toString());
//   })
//   .post("/logout", async (c) => {
//     const logoutUrl = await kindeClient.logout(sessionManagerWithCookies(c));
//     return c.redirect(logoutUrl.toString());
//   })
//   .get("/me", isAuthenticated, async (c) => {
//     const user = c.var.user;
//     return c.json({ status: true, user: user });
//   });

interface Playload {
  sub: string;
  role: string;
  exp: number;
  userId: number;
}

// customize user route
export const userRoute = new Hono()
  .post("/login", zValidator("json", fetchUserSchema), async (c) => {
    const { email, password } = c.req.valid("json");
    const user = await db
      .select()
      .from(userSchema)
      .where(eq(userSchema.email, email))
      .then((user) => user[0]);
    if (!user) {
      return c.json({ status: false, message: "user not found" }, 404);
    }
    const ok = await Bun.password.verify(password, user.password);
    if (!ok) {
      return c.json({ status: false, message: "password not match" }, 401);
    }

    const playload: Playload = {
      sub: "notes app",
      role: "user",
      exp:
        Math.floor(Date.now() / 1000) +
        60 * 60 * Number.parseInt(process.env.EXPIRE!),
      userId: user.id,
    };
    const token = await sign(playload, process.env.SECRET!);
    return c.json(
      {
        status: true,
        user: { ...user, password: undefined },
        token: token,
      },
      200
    );
  })
  .post("/register", zValidator("json", createUserSchema), async (c) => {
    const { name, email, password } = c.req.valid("json");
    const user = await db
      .select()
      .from(userSchema)
      .where(eq(userSchema.email, email))
      .then((user) => user[0]);
    if (user) {
      return c.json({ status: false, message: "user already exists" }, 409);
    }
    const hash = await Bun.password.hash(password);
    // const hash = "aaa";
    const result = await db
      .insert(userSchema)
      .values({
        name,
        email,
        password: hash,
      })
      .returning({
        id: userSchema.id,
        name: userSchema.name,
        email: userSchema.email,
        createdAt: userSchema.createdAt,
        updatedAt: userSchema.updatedAt,
      })
      .then((res) => res[0]);
    return c.json({ status: true, user: result }, 201);
  })
  .post("/logout", isAuthenticated, async (c) => {
    return c.json({ status: true, message: "logout Success" });
  })
  .get("/me", isAuthenticated, async (c) => {
    const user = c.var.user;
    return c.json({ status: true, user: user });
  });
