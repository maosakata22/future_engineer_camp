"use client";

import { createAuthClient } from "better-auth/react";
import { dashClient } from "@better-auth/infra/client";

const authBaseURL = `${
  process.env.BETTER_AUTH_URL || process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"
}/api/auth`;

export const authClient = createAuthClient({
  baseURL: authBaseURL,
  plugins: [dashClient()],
});
