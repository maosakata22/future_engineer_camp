// types/order.ts

export type OrderStatus =
  | "received"   // 受付
  | "cooking"    // 調理中
  | "served";    // 提供済み

export const orderStatusLabels: Record<OrderStatus, string> = {
  received: "受付",
  cooking: "調理中",
  served: "提供済み",
};

export type OrderItem = {
  menuItemId: string;
  name: string;
  price: number;
  quantity: number;
};

export type Order = {
  id: string;
  tableId: string;
  status: OrderStatus;
  items: OrderItem[];
  totalAmount: number;
  createdAt: string;
};