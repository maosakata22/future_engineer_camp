"use client";

import { use, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { MenuItem } from "@/types/menu";

type CartItem = {
  menuItem: MenuItem;
  quantity: number;
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

  useEffect(() => {
    const stored = typeof window !== "undefined" ? localStorage.getItem(`cart_${tableId}`) : null;
    if (!stored) return;

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

  const handleConfirm = () => {
    localStorage.removeItem(`cart_${tableId}`);
    setCartItems([]);
    router.push(`/customer/${tableId}/complete`);
  };

  const handleBack = () => {
    router.push(`/customer/${tableId}/menu`);
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
            <p>カートに商品がありません。</p>
            <button
              type="button"
              className="mt-4 inline-flex h-12 w-full items-center justify-center rounded-xl border border-gray-300 bg-white text-gray-700 hover:bg-gray-50"
              onClick={handleBack}
            >
              メニューに戻る
            </button>
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
                    <p className="font-semibold">{item.quantity} 個</p>
                    <p className="text-sm text-muted-foreground">¥{(item.menuItem.price ?? 0) * item.quantity}</p>
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

            <div className="space-y-2">
              <button
                type="button"
                className="h-12 w-full rounded-xl bg-red-600 text-white hover:bg-red-700"
                onClick={handleConfirm}
              >
                注文を確定する
              </button>
              <button
                type="button"
                className="h-12 w-full rounded-xl border border-gray-300 bg-white text-gray-700 hover:bg-gray-50"
                onClick={handleBack}
              >
                メニューに戻る
              </button>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}
