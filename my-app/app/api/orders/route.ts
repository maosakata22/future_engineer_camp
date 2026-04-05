import { NextRequest, NextResponse } from "next/server";
import { orderQueries } from "@/lib/db/queries";
import { getStaffSessionFromHeaders } from "@/lib/auth/session";

export async function GET(request: NextRequest) {
  try {
    const staffSession = await getStaffSessionFromHeaders(request.headers);
    if (!staffSession) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 }
      );
    }

    const orders = await orderQueries.getAll();

    return NextResponse.json({
      success: true,
      data: orders,
    });
  } catch (error) {
    console.error("Error fetching orders:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch orders" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const requiredFields = ["tableId", "totalPrice", "orderItems"];
    for (const field of requiredFields) {
      if (!body[field]) {
        return NextResponse.json(
          { success: false, error: `Missing required field: ${field}` },
          { status: 400 }
        );
      }
    }

    const newOrder = await orderQueries.create({
      tableId: body.tableId,
      status: body.status || "pending",
      totalPrice: body.totalPrice,
      orderItems: body.orderItems,
    });

    return NextResponse.json(
      {
        success: true,
        data: newOrder,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error creating order:", error);
    return NextResponse.json(
      { success: false, error: "Failed to create order" },
      { status: 500 }
    );
  }
}
