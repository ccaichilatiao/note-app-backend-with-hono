import { Hono } from "hono";
import { logger } from "hono/logger";
import { userRoute } from "./routes/user.route";
import { noteRoute } from "./routes/note.route";
import { cors } from "hono/cors";

const app = new Hono();
app.use("*", logger());
app.use(
  "/api/*",
  cors({
    origin: "http://localhost:3000",
    allowHeaders: ["Content-Type", "Authorization"],
    credentials: true,
  })
);

app.get("/ping", async (c) => {
  return c.text("pong");
});

app.basePath("/api").route("/", userRoute).route("/notes", noteRoute);
export default app;

// export type ApiRoutes = typeof apiRoutes;
