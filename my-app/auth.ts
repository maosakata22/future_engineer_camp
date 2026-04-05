import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { nextCookies } from "better-auth/next-js";
import { dash } from "@better-auth/infra";
import { db } from "@/lib/db";
import * as schema from "@/lib/db/schema";

const secret =
  process.env.BETTER_AUTH_SECRET ||
  process.env.AUTH_SECRET ||
  "development-only-secret-change-me";

const baseURL =
  process.env.BETTER_AUTH_URL ||
  process.env.NEXT_PUBLIC_APP_URL ||
  "http://localhost:3000";

const infraPlugins = process.env.BETTER_AUTH_API_KEY
  ? [
      dash({
        apiKey: process.env.BETTER_AUTH_API_KEY,
        apiUrl: process.env.BETTER_AUTH_API_URL,
        kvUrl: process.env.BETTER_AUTH_KV_URL,
      }),
    ]
  : [];

export const auth = betterAuth({
  database: drizzleAdapter(db, {
    provider: "pg",
    schema,
    usePlural: true,
  }),
  basePath: "/api/auth",
  baseURL,
  secret,
  emailAndPassword: {
    enabled: true,
  },
  plugins: [nextCookies(), ...infraPlugins],
});
