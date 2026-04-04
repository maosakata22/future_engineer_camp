"use client";

import { use, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { MenuItem } from "@/types/menu";

type CartItem = {
  menuItem: MenuItem;
  quantity: number;
};

type OrderHistoryItem = {
  id: string;
  orderedAt: string;
  items: CartItem[];
  totalAmount: number;
};

type PageProps = {
  params: Promise<{
    tableId: string;
  }>;
};

export default function OrderHistoryPage({ params }: PageProps) {
  const { tableId } = use(params);
  const router = useRouter();
  const [orders] = useState<OrderHistoryItem[]>(() => {
    if (typeof window === "undefined") {
      return [];
    }

    const historyKey = `order_history_${tableId}`;
    const stored = localStorage.getItem(historyKey);

    if (!stored) {
      return [];
    }

    try {
      return JSON.parse(stored);
    } catch {
      return [];
    }
  });

  const totalCount = useMemo(() => {
    return orders.reduce(
      (sum, order) => sum + order.items.reduce((itemSum, item) => itemSum + item.quantity, 0),
      0
    );
  }, [orders]);

  const totalAmount = useMemo(() => {
    return orders.reduce((sum, order) => sum + order.totalAmount, 0);
  }, [orders]);

  return (
    <main className="min-h-dvh bg-yellow-50 px-3 py-4">
      <div className="mx-auto w-full max-w-md space-y-4">
        <header className="space-y-1">
          <h1 className="text-center text-2xl font-black">注文履歴</h1>
          <p className="text-center text-sm text-muted-foreground">お席番号: {tableId}</p>
        </header>

        <div className="rounded-2xl border bg-white p-4 text-sm">
          <p>注文回数: {orders.length}回</p>
          <div className="flex items-center justify-between gap-4">
            <p>合計点数: {totalCount}点</p>
            <p>合計金額: ¥{totalAmount}</p>
          </div>
        </div>

        {orders.length === 0 ? (
          <div className="rounded-2xl border bg-white p-6 text-center text-sm text-muted-foreground">
            注文履歴はまだありません。
          </div>
        ) : (
          <div className="space-y-3">
            {orders.map((order, index) => (
              <Card key={order.id} className="rounded-2xl">
                <CardHeader className="pb-2">
                  <CardTitle className="flex items-center justify-between text-base">
                    <span>{index + 1}回目の注文</span>
                    <span className="text-sm font-medium text-muted-foreground">
                      ¥{order.totalAmount}
                    </span>
                  </CardTitle>
                  <p className="text-xs text-muted-foreground">
                    {new Date(order.orderedAt).toLocaleString("ja-JP")}
                  </p>
                </CardHeader>

                <CardContent className="space-y-2">
                  {order.items.map((item) => (
                    <div
                      key={`${order.id}-${item.menuItem.id}`}
                      className="flex items-center justify-between rounded-xl border px-3 py-2 text-sm"
                    >
                      <div>
                        <p className="font-medium">{item.menuItem.name}</p>
                        <p className="text-xs text-muted-foreground">
                          ¥{item.menuItem.price ?? 0} x {item.quantity}
                        </p>
                      </div>
                      <div className="font-medium">
                        ¥{(item.menuItem.price ?? 0) * item.quantity}
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        <div className="pt-2">
          <Button
            type="button"
            className="h-12 w-full rounded-xl"
            onClick={() => router.push(`/customer/${tableId}/menu`)}
          >
            メニューに戻る
          </Button>
        </div>
      </div>
    </main>
  );
}
