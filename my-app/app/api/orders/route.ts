import { NextRequest, NextResponse } from 'next/server';
import { orderQueries } from '@/lib/db/queries';

// GET /api/orders - 注文を取得
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const tableId = searchParams.get('tableId');

    let orders;

    if (tableId) {
      orders = await orderQueries.getByTableId(tableId);
    } else {
      // スタッフ用 - 全注文を取得
      orders = await orderQueries.getAll();
    }

    return NextResponse.json({
      success: true,
      data: orders,
    });
  } catch (error) {
    console.error('Error fetching orders:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch orders' },
      { status: 500 }
    );
  }
}

// POST /api/orders - 新しい注文を作成
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // バリデーション
    const requiredFields = ['tableId', 'totalPrice', 'orderItems'];
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
      status: body.status || 'pending',
      totalPrice: body.totalPrice,
      orderItems: body.orderItems,
    });

    return NextResponse.json({
      success: true,
      data: newOrder,
    }, { status: 201 });
  } catch (error) {
    console.error('Error creating order:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to create order' },
      { status: 500 }
    );
  }
}