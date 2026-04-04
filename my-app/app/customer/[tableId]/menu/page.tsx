"use client";

import { use, useMemo, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

type Category = "food" | "drink" | "dessert";

type MenuItem = {
  id: string;
  name: string;
  price: number;
  description: string;
  category: Category;
};

const PAGE_SIZE = 10;

const categoryLabels: Record<Category, string> = {
  food: "フード",
  drink: "ドリンク",
  dessert: "デザート",
};

function createMockItems(category: Category, label: string, basePrice: number): MenuItem[] {
  return Array.from({ length: 20 }, (_, i) => ({
    id: `${category}-${i + 1}`,
    name: `${label}${i + 1}`,
    price: basePrice + i * 30,
    description: `${label}${i + 1} のサンプル説明です。`,
    category,
  }));
}

const allItems: MenuItem[] = [
  ...createMockItems("food", "料理", 780),
  ...createMockItems("drink", "ドリンク", 380),
  ...createMockItems("dessert", "デザート", 480),
];

type PageProps = {
  params: Promise<{
    tableId: string;
  }>;
};

export default function MenuPage({ params }: PageProps) {
  const { tableId } = use(params);
  const [selectedCategory, setSelectedCategory] = useState<Category>("food");
  const [currentPage, setCurrentPage] = useState(1);
  const [quantities, setQuantities] = useState<Record<string, number>>({});

  const filteredItems = useMemo(() => {
    return allItems.filter((item) => item.category === selectedCategory);
  }, [selectedCategory]);

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

  const handleAdd = (item: MenuItem) => {
    const quantity = getQuantity(item.id);
    console.log("追加（仮）:", {
      tableId,
      itemId: item.id,
      itemName: item.name,
      quantity,
    });
  };

  return (
    <main className="min-h-dvh bg-muted/30">
      <div className="mx-auto w-full max-w-md px-3 py-4">
        <header className="mb-4">
          <h1 className="text-3xl font-bold tracking-tight">Osaki亭</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            お席番号: {tableId}
          </p>
        </header>

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
                onClick={() => console.log("注文確認")}
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
              {pagedItems.map((item) => {
                const quantity = getQuantity(item.id);

                return (
                  <Card key={item.id} className="rounded-2xl">
                    <CardHeader className="pb-2">
                      <CardTitle className="flex items-start justify-between gap-3 text-base">
                        <span className="leading-6">{item.name}</span>
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
              })}
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