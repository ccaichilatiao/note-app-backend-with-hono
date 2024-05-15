import app from "./app";

Bun.serve({
  port: process.env.PORT || "8000",
  fetch: app.fetch,
});

console.log("Bun server running");
