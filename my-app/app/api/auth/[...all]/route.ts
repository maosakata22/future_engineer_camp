import { NextRequest, NextResponse } from "next/server";
import { toNextJsHandler } from "better-auth/next-js";
import { auth } from "@/auth";
import { staffQueries } from "@/lib/db/queries";

const authHandler = toNextJsHandler(auth);

async function isAllowedStaffSignup(request: NextRequest) {
  const pathname = new URL(request.url).pathname;
  if (!pathname.endsWith("/sign-up/email")) {
    return true;
  }

  try {
    const body = await request.clone().json();
    const email = typeof body?.email === "string" ? body.email : "";

    if (!email) {
      return false;
    }

    const staffMember = await staffQueries.getActiveByEmail(email);
    return Boolean(staffMember);
  } catch {
    return false;
  }
}

export async function GET(request: Request) {
  return authHandler.GET(request);
}

export async function POST(request: NextRequest) {
  const allowed = await isAllowedStaffSignup(request);

  if (!allowed) {
    return NextResponse.json(
      { success: false, error: "スタッフとして登録されているメールアドレスのみ利用できます。" },
      { status: 403 }
    );
  }

  return authHandler.POST(request);
}

export async function PATCH(request: Request) {
  return authHandler.PATCH(request);
}

export async function PUT(request: Request) {
  return authHandler.PUT(request);
}

export async function DELETE(request: Request) {
  return authHandler.DELETE(request);
}
