"use client";

import { use, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { MenuItem, Category, categoryLabels } from "@/types/menu";

const PAGE_SIZE = 10;

type CartItem = {
    menuItem: MenuItem;
    quantity: number;
};

type PageProps = {
    params: Promise<{
        tableId: string;
    }>;
};


export default function MenuPage({ params }: PageProps) {
    const { tableId } = use(params);
    const router = useRouter();
    const [items, setItems] = useState<MenuItem[]>([]);
    const [selectedCategory, setSelectedCategory] = useState<Category>("salad");
    const [currentPage, setCurrentPage] = useState(1);
    const [quantities, setQuantities] = useState<Record<string, number>>({});
    const [cartItems, setCartItems] = useState<CartItem[]>([]);
    const [isCartLoaded, setIsCartLoaded] = useState(false);
    const [toastMessage, setToastMessage] = useState<string | null>(null);
    const [errorMessage, setErrorMessage] = useState<string | null>(null);

    useEffect(() => {
        const fetchMenu = async () => {
            try {
                const response = await fetch('/api/menu');
                const result = await response.json();
                if (!response.ok || !result?.success) {
                    throw new Error(result?.error || 'Failed to load menu');
                }
                const loadedItems: MenuItem[] = result.data.map((item: any) => ({
                    ...item,
                    id: String(item.id),
                }));
                setItems(loadedItems);
            } catch (error) {
                console.error('Failed to load menu:', error);
                setErrorMessage('メニューの読み込みに失敗しました。');
            }
        };

        fetchMenu();
    }, []);

    const filteredItems = useMemo(() => {
        return items.filter((item) => item.category === selectedCategory);
    }, [items, selectedCategory]);

    useEffect(() => {
        const stored = typeof window !== "undefined" ? localStorage.getItem(`cart_${tableId}`) : null;

        if (stored !== null) {
            try {
                setCartItems(JSON.parse(stored));
            } catch {
                setCartItems([]);
            }
        }

        setIsCartLoaded(true);
    }, [tableId]);

    useEffect(() => {
        if (!toastMessage) return;

        const timer = setTimeout(() => setToastMessage(null), 2000);
        return () => clearTimeout(timer);
    }, [toastMessage]);

    useEffect(() => {
        if (!isCartLoaded || typeof window === "undefined") return;
        localStorage.setItem(`cart_${tableId}`, JSON.stringify(cartItems));
    }, [cartItems, tableId, isCartLoaded]);

    const saveCartItems = (nextCartItems: CartItem[]) => {
        if (typeof window !== "undefined") {
            localStorage.setItem(`cart_${tableId}`, JSON.stringify(nextCartItems));
        }
    };

    const totalPages = Math.ceil(filteredItems.length / PAGE_SIZE);

    const pagedItems = useMemo(() => {
        const start = (currentPage - 1) * PAGE_SIZE;
        return filteredItems.slice(start, start + PAGE_SIZE);
    }, [filteredItems, currentPage]);

    const handleCategoryChange = (category: Category) => {
        setSelectedCategory(category);
        setCurrentPage(1);
    };

    const getQuantity = (itemId: string) => quantities[itemId] ?? 1;

    const decreaseQuantity = (itemId: string) => {
        setQuantities((prev) => {
            const current = prev[itemId] ?? 1;
            return {
                ...prev,
                [itemId]: Math.max(1, current - 1),
            };
        });
    };

    const increaseQuantity = (itemId: string) => {
        setQuantities((prev) => {
            const current = prev[itemId] ?? 1;
            return {
                ...prev,
                [itemId]: current + 1,
            };
        });
    };

    const handleConfirmOrder = () => {
        router.push(`/customer/${tableId}/cart`);
    };

    const handleAdd = (item: MenuItem) => {
        const quantity = getQuantity(item.id);

        setCartItems((prev) => {
            const index = prev.findIndex((cartItem) => cartItem.menuItem.id === item.id);
            const nextCartItems =
                index >= 0
                    ? prev.map((cartItem, idx) =>
                          idx === index
                              ? { ...cartItem, quantity: cartItem.quantity + quantity }
                              : cartItem
                      )
                    : [...prev, { menuItem: item, quantity }];

            saveCartItems(nextCartItems);
            return nextCartItems;
        });

        setToastMessage("追加しました！");

        console.log("追加（仮）:", {
            tableId,
            itemId: item.id,
            itemName: item.name,
            quantity,
        });
    };

    return (
        // <main className="min-h-dvh bg-muted/30">
        <main className="min-h-dvh bg-yellow-50 bg-[linear-gradient(0deg,rgba(160,120,60,0.08) 1px,transparent 1px),linear-gradient(90deg,rgba(160,120,60,0.06) 1px,transparent 1px),radial-gradient(circle at 15% 25%,rgba(0,0,0,0.04),transparent 40%),radial-gradient(circle at 85% 75%,rgba(0,0,0,0.03),transparent 50%)]" style={{ backgroundSize: '4px 4px, 4px 4px, 100% 100%, 100% 100%' }}>
            <div className="mx-auto w-full max-w-md px-3 py-4">
                <header className="mb-4">
                    {/* <h1 className="text-3xl font-bold tracking-tight">Osaki亭</h1> */}
                    <h1 className="text-3xl font-black tracking-wide text-center">
                        Osaki亭
                    </h1>
                    <p className="mt-1 text-sm text-muted-foreground text-center">
                        お席番号: {tableId}
                    </p>
                </header>

                {toastMessage ? (
                    <div className="fixed bottom-6 left-1/2 z-50 w-[min(90vw,360px)] -translate-x-1/2 rounded-2xl bg-black/90 px-4 py-3 text-center text-sm text-white shadow-lg">
                        {toastMessage}
                    </div>
                ) : null}

                <div className="flex gap-3">
                    <aside className="w-24 shrink-0">
                        <div className="sticky top-4 space-y-2">
                            {(Object.keys(categoryLabels) as Category[]).map((category) => {
                                const isActive = selectedCategory === category;
                                return (
                                    <Button
                                        key={category}
                                        type="button"
                                        variant={isActive ? "default" : "outline"}
                                        className="h-12 w-full justify-center rounded-xl px-2 text-sm"
                                        onClick={() => handleCategoryChange(category)}
                                    >
                                        {categoryLabels[category]}
                                    </Button>
                                );
                            })}

                            <Button
                                type="button"
                                className="mt-2 h-12 w-full rounded-xl bg-red-600 text-white hover:bg-red-700"
                                onClick={handleConfirmOrder}
                            >
                                注文確認
                            </Button>
                        </div>
                    </aside>

                    <section className="min-w-0 flex-1 space-y-3">
                        <div className="flex items-center justify-between">
                            <h2 className="text-lg font-semibold">
                                {categoryLabels[selectedCategory]}
                            </h2>
                            <p className="text-xs text-muted-foreground">
                                {currentPage} / {totalPages} ページ
                            </p>
                        </div>

                        <div className="space-y-3">
                            {errorMessage ? (
                                <div className="rounded-2xl border bg-red-50 p-4 text-sm text-red-700">
                                    {errorMessage}
                                </div>
                            ) : pagedItems.length === 0 ? (
                                <div className="rounded-2xl border bg-muted p-6 text-center text-sm text-muted-foreground">
                                    メニューが読み込まれています...
                                </div>
                            ) : (
                                pagedItems.map((item) => {
                                    const quantity = getQuantity(item.id);

                                    return (
                                        <Card key={item.id} className="rounded-2xl">
                                            <CardHeader className="pb-2">
                                                {item.imageUrl && (
                                                    <div className="aspect-video w-full overflow-hidden rounded-xl">
                                                        <img
                                                            src={item.imageUrl}
                                                            alt={item.name}
                                                            className="h-full w-full object-cover"
                                                        />
                                                    </div>
                                                )}
                                                <CardTitle className="flex items-start justify-between gap-3 text-base">
                                                    <div className="flex items-center gap-2">
                                                        <span className="leading-6">{item.name}</span>
                                                        {item.isPopular && (
                                                            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800">
                                                                おすすめ
                                                            </span>
                                                        )}
                                                    </div>
                                                    <span className="shrink-0 text-sm font-medium text-muted-foreground">
                                                        ¥{item.price}
                                                    </span>
                                                </CardTitle>
                                            </CardHeader>

                                            <CardContent className="space-y-4">
                                                <p className="text-sm leading-6 text-muted-foreground">
                                                    {item.description}
                                                </p>

                                                <div className="flex items-center justify-between gap-2">
                                                    <div className="flex items-center gap-2">
                                                        <Button
                                                            type="button"
                                                            variant="outline"
                                                            className="h-9 w-9 rounded-xl p-0"
                                                            onClick={() => decreaseQuantity(item.id)}
                                                        >
                                                            -
                                                        </Button>

                                                        <div className="flex h-9 min-w-10 items-center justify-center rounded-xl border px-3 text-sm font-medium">
                                                            {quantity}
                                                        </div>

                                                        <Button
                                                            type="button"
                                                            variant="outline"
                                                            className="h-9 w-9 rounded-xl p-0"
                                                            onClick={() => increaseQuantity(item.id)}
                                                        >
                                                            +
                                                        </Button>
                                                    </div>

                                                    <Button
                                                        type="button"
                                                        className="h-12 rounded-xl"
                                                        onClick={() => handleAdd(item)}
                                                    >
                                                        追加
                                                    </Button>
                                                </div>
                                            </CardContent>
                                        </Card>
                                    );
                                })
                            )}
                        </div>

                        <div className="flex items-center justify-between pt-2">
                            <Button
                                type="button"
                                variant="outline"
                                className="h-12 rounded-xl"
                                onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
                                disabled={currentPage === 1}
                            >
                                前へ
                            </Button>

                            <div className="text-sm text-muted-foreground">
                                {Math.min((currentPage - 1) * PAGE_SIZE + 1, filteredItems.length)}-
                                {Math.min(currentPage * PAGE_SIZE, filteredItems.length)} 件表示
                            </div>

                            <Button
                                type="button"
                                variant="outline"
                                className="h-12 rounded-xl"
                                onClick={() =>
                                    setCurrentPage((prev) => Math.min(totalPages, prev + 1))
                                }
                                disabled={currentPage === totalPages}
                            >
                                次へ
                            </Button>
                        </div>

                    </section>
                </div>
            </div>
        </main>
    );
}