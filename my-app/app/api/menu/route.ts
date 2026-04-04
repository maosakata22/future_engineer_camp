import { NextRequest, NextResponse } from 'next/server';
import { menuQueries } from '@/lib/db/queries';

// GET /api/menu - 全メニュー項目を取得
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const category = searchParams.get('category');
    const popular = searchParams.get('popular');

    let menuItems;

    if (popular === 'true') {
      menuItems = await menuQueries.getPopular();
    } else if (category) {
      menuItems = await menuQueries.getByCategory(category);
    } else {
      menuItems = await menuQueries.getAll();
    }

    return NextResponse.json({
      success: true,
      data: menuItems,
    });
  } catch (error) {
    console.error('Error fetching menu items:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch menu items' },
      { status: 500 }
    );
  }
}

// POST /api/menu - 新しいメニュー項目を作成
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // バリデーション
    const requiredFields = ['name', 'price', 'category'];
    for (const field of requiredFields) {
      if (!body[field]) {
        return NextResponse.json(
          { success: false, error: `Missing required field: ${field}` },
          { status: 400 }
        );
      }
    }

    const newItem = await menuQueries.create({
      name: body.name,
      price: body.price,
      description: body.description,
      category: body.category,
      imageUrl: body.imageUrl,
      isAvailable: body.isAvailable ?? true,
      isPopular: body.isPopular ?? false,
      area: body.area,
    });

    return NextResponse.json({
      success: true,
      data: newItem,
    }, { status: 201 });
  } catch (error) {
    console.error('Error creating menu item:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to create menu item' },
      { status: 500 }
    );
  }
}