import "server-only";
import { createClient } from "@libsql/client";
import { drizzle } from "drizzle-orm/libsql";
import * as schema from "./schema";

function connect() {
  const url = process.env.TURSO_DATABASE_URL;
  const authToken = process.env.TURSO_AUTH_TOKEN;
  if (!url || !authToken) throw new Error("Database configuration is missing");
  return drizzle(createClient({ url, authToken }), { schema });
}
let database: ReturnType<typeof connect> | undefined;
export const getDb = () => (database ??= connect());
