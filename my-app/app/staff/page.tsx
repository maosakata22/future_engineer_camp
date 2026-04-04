"use client";

import { useEffect, useMemo, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Order,
  OrderItem,
  OrderStatus,
  orderStatusLabels,
  orderStatusOptions,
} from "@/types/order";

type ApiOrder = {
  id: number | string;
  tableId: string;
  status: string;
  totalPrice: number;
  orderItems: unknown;
  createdAt: string | Date;
  updatedAt?: string | Date | null;
};

const statusColors: Record<OrderStatus, string> = {
  pending: "bg-slate-100 text-slate-700",
  cooking: "bg-amber-100 text-amber-800",
  ready_to_serve: "bg-sky-100 text-sky-800",
  served: "bg-emerald-100 text-emerald-800",
  cancelled: "bg-rose-100 text-rose-800",
};

function normalizeStatus(status: string): OrderStatus {
  switch (status) {
    case "pending":
      return "pending";
    case "cooking":
      return "cooking";
    case "ready_to_serve":
      return "ready_to_serve";
    case "served":
    case "completed":
      return "served";
    case "cancelled":
      return "cancelled";
    case "confirmed":
      return "cooking";
    default:
      return "pending";
  }
}

function normalizeItems(orderItems: unknown): OrderItem[] {
  if (!Array.isArray(orderItems)) {
    return [];
  }

  return orderItems.map((item) => {
    const candidate = item as {
      quantity?: number;
      menuItem?: {
        id?: string | number;
        name?: string;
        price?: number;
        description?: string;
        imageUrl?: string;
      };
      menuItemId?: string;
      name?: string;
      price?: number;
    };

    return {
      quantity: candidate.quantity ?? 0,
      menuItemId:
        candidate.menuItemId ?? (candidate.menuItem?.id ? String(candidate.menuItem.id) : undefined),
      name: candidate.name ?? candidate.menuItem?.name,
      price: candidate.price ?? candidate.menuItem?.price,
      menuItem: candidate.menuItem
        ? {
            id: candidate.menuItem.id ? String(candidate.menuItem.id) : undefined,
            name: candidate.menuItem.name,
            price: candidate.menuItem.price,
            description: candidate.menuItem.description,
            imageUrl: candidate.menuItem.imageUrl,
          }
        : undefined,
    };
  });
}

function normalizeOrder(order: ApiOrder): Order {
  return {
    id: String(order.id),
    tableId: order.tableId,
    status: normalizeStatus(order.status),
    items: normalizeItems(order.orderItems),
    totalAmount: order.totalPrice,
    createdAt: new Date(order.createdAt).toISOString(),
    updatedAt: order.updatedAt ? new Date(order.updatedAt).toISOString() : undefined,
  };
}

export default function StaffOrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [updatingOrderId, setUpdatingOrderId] = useState<string | null>(null);
  const [tableQuery, setTableQuery] = useState("");

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        setLoading(true);
        setErrorMessage(null);

        const response = await fetch("/api/orders", { cache: "no-store" });
        const result = await response.json();

        if (!response.ok || !result?.success) {
          throw new Error(result?.error || "Failed to fetch orders");
        }

        const normalizedOrders = (result.data as ApiOrder[]).map(normalizeOrder);
        setOrders(normalizedOrders);
      } catch (error) {
        console.error("Failed to fetch orders:", error);
        setErrorMessage("注文一覧の読み込みに失敗しました。");
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, []);

  const handleStatusChange = async (orderId: string, status: OrderStatus) => {
    try {
      setUpdatingOrderId(orderId);
      setErrorMessage(null);

      const response = await fetch(`/api/orders/${orderId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ status }),
      });

      const result = await response.json();
      if (!response.ok || !result?.success) {
        throw new Error(result?.error || "Failed to update order status");
      }

      setOrders((prev) =>
        prev.map((order) =>
          order.id === orderId
            ? {
                ...order,
                status,
                updatedAt: new Date().toISOString(),
              }
            : order
        )
      );
    } catch (error) {
      console.error("Failed to update order status:", error);
      setErrorMessage("注文ステータスの更新に失敗しました。");
    } finally {
      setUpdatingOrderId(null);
    }
  };

  const filteredOrders = useMemo(() => {
    const normalizedQuery = tableQuery.trim().toLowerCase();
    if (!normalizedQuery) {
      return orders;
    }

    return orders.filter((order) => order.tableId.toLowerCase().includes(normalizedQuery));
  }, [orders, tableQuery]);

  const tableSummary = useMemo(() => {
    const normalizedQuery = tableQuery.trim().toLowerCase();
    if (!normalizedQuery) {
      return null;
    }

    const matchedOrders = orders.filter((order) => order.tableId.toLowerCase() === normalizedQuery);
    const totalAmount = matchedOrders.reduce((sum, order) => sum + order.totalAmount, 0);
    const totalItems = matchedOrders.reduce(
      (sum, order) => sum + order.items.reduce((itemSum, item) => itemSum + item.quantity, 0),
      0
    );

    return {
      tableId: tableQuery.trim(),
      orderCount: matchedOrders.length,
      totalAmount,
      totalItems,
    };
  }, [orders, tableQuery]);

  const statusCounts = useMemo(() => {
    return orderStatusOptions.reduce<Record<OrderStatus, number>>((acc, status) => {
      acc[status] = orders.filter((order) => order.status === status).length;
      return acc;
    }, {} as Record<OrderStatus, number>);
  }, [orders]);

  return (
    <main className="min-h-dvh bg-stone-100 px-4 py-6">
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-6">
        <header className="flex flex-col gap-3 rounded-3xl bg-white p-6 shadow-sm ring-1 ring-black/5 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="text-sm font-medium text-muted-foreground">Staff Console</p>
            <h1 className="text-3xl font-black tracking-tight">注文受信画面</h1>
            <p className="mt-2 text-sm text-muted-foreground">
              受信した注文の確認、進行ステータスの更新、座席ごとの会計確認を行えます。
            </p>
          </div>

          <div className="grid grid-cols-2 gap-2 text-sm md:grid-cols-5">
            {orderStatusOptions.map((status) => (
              <div key={status} className="rounded-2xl bg-muted px-3 py-2 text-center">
                <p className="text-xs text-muted-foreground">{orderStatusLabels[status]}</p>
                <p className="text-lg font-bold">{statusCounts[status] ?? 0}</p>
              </div>
            ))}
          </div>
        </header>

        <section className="grid gap-6 lg:grid-cols-[340px_minmax(0,1fr)]">
          <Card className="rounded-3xl bg-white">
            <CardHeader>
              <CardTitle>会計確認</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <label htmlFor="table-query" className="text-sm font-medium">
                  座席番号
                </label>
                <Input
                  id="table-query"
                  value={tableQuery}
                  onChange={(event) => setTableQuery(event.target.value)}
                  placeholder="例: A01"
                  className="h-11 rounded-xl bg-white"
                />
                <p className="text-xs text-muted-foreground">
                  座席番号を入力すると、その席の注文総量を確認できます。
                </p>
              </div>

              {tableSummary ? (
                <div className="space-y-3 rounded-2xl border bg-muted/40 p-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">対象座席</span>
                    <span className="font-semibold">{tableSummary.tableId}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">注文回数</span>
                    <span className="font-semibold">{tableSummary.orderCount}回</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">注文点数</span>
                    <span className="font-semibold">{tableSummary.totalItems}点</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">注文総額</span>
                    <span className="text-lg font-bold">¥{tableSummary.totalAmount}</span>
                  </div>
                  {tableSummary.orderCount === 0 ? (
                    <p className="text-sm text-amber-700">該当する注文はまだありません。</p>
                  ) : null}
                </div>
              ) : (
                <div className="rounded-2xl border border-dashed p-4 text-sm text-muted-foreground">
                  座席番号を入力すると、注文回数、点数、総額をここに表示します。
                </div>
              )}
            </CardContent>
          </Card>

          <section className="space-y-4">
            {errorMessage ? (
              <div className="rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
                {errorMessage}
              </div>
            ) : null}

            {loading ? (
              <Card className="rounded-3xl bg-white">
                <CardContent className="py-10 text-center text-sm text-muted-foreground">
                  注文一覧を読み込んでいます...
                </CardContent>
              </Card>
            ) : filteredOrders.length === 0 ? (
              <Card className="rounded-3xl bg-white">
                <CardContent className="py-10 text-center text-sm text-muted-foreground">
                  表示できる注文はありません。
                </CardContent>
              </Card>
            ) : (
              filteredOrders.map((order) => (
                <Card key={order.id} className="rounded-3xl bg-white">
                  <CardHeader className="gap-3">
                    <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="rounded-full bg-stone-900 px-3 py-1 text-xs font-semibold text-white">
                            席 {order.tableId}
                          </span>
                          <span
                            className={`rounded-full px-3 py-1 text-xs font-semibold ${statusColors[order.status]}`}
                          >
                            {orderStatusLabels[order.status]}
                          </span>
                        </div>
                        <CardTitle className="text-xl">注文番号 #{order.id}</CardTitle>
                        <p className="text-xs text-muted-foreground">
                          受信日時: {new Date(order.createdAt).toLocaleString("ja-JP")}
                        </p>
                      </div>

                      <div className="w-full max-w-[220px] space-y-2">
                        <label
                          htmlFor={`status-${order.id}`}
                          className="text-xs font-medium text-muted-foreground"
                        >
                          ステータス更新
                        </label>
                        <select
                          id={`status-${order.id}`}
                          className="h-11 w-full rounded-xl border border-input bg-white px-3 text-sm outline-none focus-visible:border-ring focus-visible:ring-2 focus-visible:ring-ring/50"
                          value={order.status}
                          onChange={(event) =>
                            handleStatusChange(order.id, event.target.value as OrderStatus)
                          }
                          disabled={updatingOrderId === order.id}
                        >
                          {orderStatusOptions.map((status) => (
                            <option key={status} value={status}>
                              {orderStatusLabels[status]}
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>
                  </CardHeader>

                  <CardContent className="space-y-4">
                    <div className="grid gap-3 md:grid-cols-2">
                      {order.items.map((item, index) => {
                        const itemName = item.name ?? item.menuItem?.name ?? `商品 ${index + 1}`;
                        const itemPrice = item.price ?? item.menuItem?.price ?? 0;
                        return (
                          <div
                            key={`${order.id}-${itemName}-${index}`}
                            className="rounded-2xl border bg-stone-50 px-4 py-3"
                          >
                            <div className="flex items-start justify-between gap-3">
                              <div>
                                <p className="font-semibold">{itemName}</p>
                                <p className="text-xs text-muted-foreground">
                                  ¥{itemPrice} x {item.quantity}
                                </p>
                              </div>
                              <p className="font-semibold">¥{itemPrice * item.quantity}</p>
                            </div>
                          </div>
                        );
                      })}
                    </div>

                    <div className="flex flex-col gap-3 rounded-2xl bg-muted/50 px-4 py-3 md:flex-row md:items-center md:justify-between">
                      <div className="text-sm text-muted-foreground">
                        合計点数: {order.items.reduce((sum, item) => sum + item.quantity, 0)}点
                      </div>
                      <div className="text-lg font-bold">合計金額: ¥{order.totalAmount}</div>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </section>
        </section>
      </div>
    </main>
  );
}
