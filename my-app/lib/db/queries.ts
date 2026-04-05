import { eq, and, desc } from 'drizzle-orm';
import { db } from './index';
import { menuItems, orders, staff, type NewMenuItem, type NewOrder, type NewStaff } from './schema';

// メニュー項目関連のクエリ
export const menuQueries = {
  // 全メニュー項目を取得
  async getAll() {
    return await db.select().from(menuItems).orderBy(menuItems.category, menuItems.name);
  },

  // カテゴリ別のメニュー項目を取得
  async getByCategory(category: string) {
    return await db
      .select()
      .from(menuItems)
      .where(and(eq(menuItems.category, category), eq(menuItems.isAvailable, true)))
      .orderBy(menuItems.name);
  },

  // 人気メニューを取得
  async getPopular() {
    return await db
      .select()
      .from(menuItems)
      .where(and(eq(menuItems.isPopular, true), eq(menuItems.isAvailable, true)))
      .orderBy(menuItems.name);
  },

  // IDでメニュー項目を取得
  async getById(id: number) {
    const result = await db
      .select()
      .from(menuItems)
      .where(eq(menuItems.id, id))
      .limit(1);

    return result[0] || null;
  },

  // メニュー項目を作成
  async create(data: NewMenuItem) {
    const result = await db.insert(menuItems).values(data).returning();
    return result[0];
  },

  // メニュー項目を更新
  async update(id: number, data: Partial<NewMenuItem>) {
    const result = await db
      .update(menuItems)
      .set({ ...data, updatedAt: new Date() })
      .where(eq(menuItems.id, id))
      .returning();

    return result[0] || null;
  },

  // メニュー項目を削除
  async delete(id: number) {
    const result = await db.delete(menuItems).where(eq(menuItems.id, id)).returning();
    return result[0] || null;
  },
};

// 注文関連のクエリ
export const orderQueries = {
  // 全注文を取得 (スタッフ用)
  async getAll() {
    return await db
      .select()
      .from(orders)
      .orderBy(desc(orders.createdAt));
  },

  // テーブルIDで注文を取得
  async getByTableId(tableId: string) {
    return await db
      .select()
      .from(orders)
      .where(eq(orders.tableId, tableId))
      .orderBy(desc(orders.createdAt));
  },

  // 注文を作成
  async create(data: NewOrder) {
    const result = await db.insert(orders).values(data).returning();
    return result[0];
  },

  // 注文ステータスを更新
  async updateStatus(id: number, status: string) {
    const result = await db
      .update(orders)
      .set({ status, updatedAt: new Date() })
      .where(eq(orders.id, id))
      .returning();

    return result[0] || null;
  },

  // 注文を取得
  async getById(id: number) {
    const result = await db
      .select()
      .from(orders)
      .where(eq(orders.id, id))
      .limit(1);

    return result[0] || null;
  },
};

// ユーティリティ関数
export const dbUtils = {
  // メニュー項目を初期データでシード
  async seedMenuItems(items: Omit<NewMenuItem, 'createdAt' | 'updatedAt'>[]) {
    const result = await db.insert(menuItems).values(items).returning();
    return result;
  },

  // データベースをリセット (開発用)
  async reset() {
    await db.delete(orders);
    await db.delete(menuItems);
  },
};

export const staffQueries = {
  async getActiveByEmail(email: string) {
    const result = await db
      .select()
      .from(staff)
      .where(and(eq(staff.email, email), eq(staff.isActive, true)))
      .limit(1);

    return result[0] || null;
  },

  async getAll() {
    return await db.select().from(staff).orderBy(staff.name);
  },

  async create(data: NewStaff) {
    const result = await db.insert(staff).values(data).returning();
    return result[0];
  },
};
