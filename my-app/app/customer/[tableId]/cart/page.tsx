"use client";

import { use, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
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

export default function CartPage({ params }: PageProps) {
  const { tableId } = use(params);
  const router = useRouter();
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    const stored = typeof window !== "undefined" ? localStorage.getItem(`cart_${tableId}`) : null;
    if (!stored) {
      setCartItems([]);
      return;
    }

    try {
      setCartItems(JSON.parse(stored));
    } catch {
      setCartItems([]);
    }
  }, [tableId]);

  const totalPrice = cartItems.reduce(
    (sum, item) => sum + (item.menuItem.price ?? 0) * item.quantity,
    0
  );

  const persistOrderHistory = () => {
    if (typeof window === "undefined" || cartItems.length === 0) return;

    const historyKey = `order_history_${tableId}`;
    const storedHistory = localStorage.getItem(historyKey);

    let history: OrderHistoryItem[] = [];
    if (storedHistory) {
      try {
        history = JSON.parse(storedHistory);
      } catch {
        history = [];
      }
    }

    const nextOrder: OrderHistoryItem = {
      id: `${Date.now()}`,
      orderedAt: new Date().toISOString(),
      items: cartItems,
      totalAmount: totalPrice,
    };

    localStorage.setItem(historyKey, JSON.stringify([nextOrder, ...history]));
  };

  const handleConfirm = async () => {
    if (cartItems.length === 0 || isSubmitting) return;

    setIsSubmitting(true);
    setErrorMessage(null);

    try {
      const response = await fetch("/api/orders", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          tableId,
          totalPrice,
          orderItems: cartItems,
        }),
      });

      const result = await response.json();
      if (!response.ok || !result?.success) {
        throw new Error(result?.error || "Failed to create order");
      }

      persistOrderHistory();
      localStorage.removeItem(`cart_${tableId}`);
      setCartItems([]);
      router.push(`/customer/${tableId}/complete`);
    } catch (error) {
      console.error("Failed to confirm order:", error);
      setErrorMessage("注文の確定に失敗しました。時間をおいてもう一度お試しください。");
      setIsSubmitting(false);
    }
  };

  const handleBack = () => {
    router.push(`/customer/${tableId}/menu`);
  };

  const handleMoveToHistory = () => {
    router.push(`/customer/${tableId}/history`);
  };

  return (
    <main className="min-h-dvh bg-muted/30 px-4 py-8">
      <div className="mx-auto w-full max-w-md space-y-6">
        <header className="space-y-2 text-center">
          <h1 className="text-3xl font-bold tracking-tight">注文確認</h1>
          <p className="text-sm text-muted-foreground">お席番号: {tableId}</p>
        </header>

        {cartItems.length === 0 ? (
          <div className="rounded-2xl border bg-background p-6 text-center text-sm text-muted-foreground">
            <p>カートに商品が入っていません。</p>
            <Button
              type="button"
              variant="outline"
              className="mt-4 h-12 w-full rounded-xl"
              onClick={handleBack}
            >
              メニューに戻る
            </Button>
          </div>
        ) : (
          <div className="space-y-4">
            {cartItems.map((item) => (
              <div key={item.menuItem.id} className="rounded-2xl border bg-background p-4">
                <div className="flex items-center gap-4">
                  {item.menuItem.imageUrl && (
                    <div className="h-16 w-16 shrink-0 overflow-hidden rounded-lg">
                      <img
                        src={item.menuItem.imageUrl}
                        alt={item.menuItem.name}
                        className="h-full w-full object-cover"
                      />
                    </div>
                  )}
                  <div className="flex-1">
                    <p className="font-semibold">{item.menuItem.name}</p>
                    <p className="text-sm text-muted-foreground">{item.menuItem.description}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold">{item.quantity}点</p>
                    <p className="text-sm text-muted-foreground">
                      ¥{(item.menuItem.price ?? 0) * item.quantity}
                    </p>
                  </div>
                </div>
              </div>
            ))}

            <div className="rounded-2xl border bg-background p-4">
              <div className="flex items-center justify-between">
                <p className="text-sm text-muted-foreground">合計</p>
                <p className="text-lg font-semibold">¥{totalPrice}</p>
              </div>
            </div>

            {errorMessage ? (
              <div className="rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
                {errorMessage}
              </div>
            ) : null}

            <div className="space-y-2">
              <Button
                type="button"
                className="h-12 w-full rounded-xl bg-red-600 text-white hover:bg-red-700"
                onClick={handleConfirm}
                disabled={isSubmitting}
              >
                {isSubmitting ? "注文を送信中..." : "注文を確定する"}
              </Button>
              <Button
                type="button"
                variant="outline"
                className="h-12 w-full rounded-xl"
                onClick={handleBack}
              >
                メニューに戻る
              </Button>
            </div>
          </div>
        )}

        <div className="border-t pt-4">
          <Button
            type="button"
            variant="outline"
            className="h-12 w-full rounded-xl"
            onClick={handleMoveToHistory}
          >
            注文履歴を見る
          </Button>
        </div>
      </div>
    </main>
  );
}
