import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";

// create a database connection and exporting it
export const db = drizzle(postgres(process.env.DATABASE_URL!, { max: 1 }), {
  logger: false,
});
