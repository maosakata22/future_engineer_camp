"use client";

import { use, useEffect } from "react";
import { useRouter } from "next/navigation";

type PageProps = {
  params: Promise<{
    tableId: string;
  }>;
};

export default function CompletePage({ params }: PageProps) {
  const { tableId } = use(params);
  const router = useRouter();

  useEffect(() => {
    // 5秒後にメニューに戻る
    const timer = setTimeout(() => {
      router.push(`/customer/${tableId}/menu`);
    }, 5000);

    return () => clearTimeout(timer);
  }, [router, tableId]);

  return (
    <main className="min-h-dvh bg-muted/30 px-4 py-8">
      <div className="mx-auto w-full max-w-md space-y-6">
        <div className="rounded-2xl border bg-background p-8 text-center">
          <div className="space-y-4">
            <div className="text-6xl">✅</div>
            <h1 className="text-2xl font-bold">注文完了</h1>
            <p className="text-muted-foreground">
              ご注文ありがとうございます。<br />
              料理が準備でき次第、お届けいたします。
            </p>
            <p className="text-sm text-muted-foreground">
              お席番号: {tableId}
            </p>
            <p className="text-xs text-muted-foreground">
              5秒後にメニューに戻ります...
            </p>
          </div>
        </div>
      </div>
    </main>
  );
}
