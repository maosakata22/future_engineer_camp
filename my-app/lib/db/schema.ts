import { pgTable, serial, text, integer, boolean, timestamp, jsonb } from 'drizzle-orm/pg-core';

// メニュー項目テーブル
export const menuItems = pgTable('menu_items', {
  id: serial('id').primaryKey(),
  name: text('name').notNull(),
  price: integer('price').notNull(),
  description: text('description'),
  category: text('category').notNull(), // 'salad', 'main', 'drink', 'dessert', 'side'
  imageUrl: text('image_url'),
  isAvailable: boolean('is_available').default(true),
  isPopular: boolean('is_popular').default(false),
  area: text('area'), // 料理の地域
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});

// 注文テーブル
export const orders = pgTable('orders', {
  id: serial('id').primaryKey(),
  tableId: text('table_id').notNull(),
  status: text('status').notNull().default('pending'), // 'pending', 'confirmed', 'completed', 'cancelled'
  totalPrice: integer('total_price').notNull(),
  orderItems: jsonb('order_items').notNull(), // 注文アイテムの配列
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});

// スタッフテーブル (オプション)
export const staff = pgTable('staff', {
  id: serial('id').primaryKey(),
  name: text('name').notNull(),
  role: text('role').notNull(), // 'manager', 'chef', 'server'
  isActive: boolean('is_active').default(true),
  createdAt: timestamp('created_at').defaultNow(),
});

// タイプ定義
export type MenuItem = typeof menuItems.$inferSelect;
export type NewMenuItem = typeof menuItems.$inferInsert;

export type Order = typeof orders.$inferSelect;
export type NewOrder = typeof orders.$inferInsert;

export type Staff = typeof staff.$inferSelect;
export type NewStaff = typeof staff.$inferInsert;