// types/order.ts

export type OrderStatus =
  | "pending"
  | "cooking"
  | "ready_to_serve"
  | "served"
  | "cancelled";

export const orderStatusLabels: Record<OrderStatus, string> = {
  pending: "未着手",
  cooking: "調理中",
  ready_to_serve: "提供待ち",
  served: "提供済み",
  cancelled: "取消済み",
};

export const orderStatusOptions: OrderStatus[] = [
  "pending",
  "cooking",
  "ready_to_serve",
  "served",
  "cancelled",
];

export type OrderItem = {
  menuItemId?: string;
  name?: string;
  price?: number;
  quantity: number;
  menuItem?: {
    id?: string;
    name?: string;
    price?: number;
    description?: string;
    imageUrl?: string;
  };
};

export type Order = {
  id: string;
  tableId: string;
  status: OrderStatus;
  items: OrderItem[];
  totalAmount: number;
  createdAt: string;
  updatedAt?: string;
};
