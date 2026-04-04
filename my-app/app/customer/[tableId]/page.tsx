import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export default async function CustomerEntrancePage({ params }: { params: Promise<{ tableId: string }> }) {
  const storeName = "Osaki亭";
  const { tableId } = await params;

  return (
    <main className="min-h-dvh bg-muted/30 px-4 py-8">
      <div className="mx-auto flex min-h-[calc(100dvh-4rem)] max-w-md items-center justify-center">
        <Card className="w-full rounded-2xl shadow-sm">
          <CardHeader className="space-y-2 text-center">
            <CardDescription className="text-sm">
              QRコードからアクセス中
            </CardDescription>
            <CardTitle className="text-2xl font-bold tracking-tight">
              {storeName}
            </CardTitle>
          </CardHeader>

          <CardContent className="space-y-6">
            <div className="rounded-xl border bg-background p-4 text-center">
              <p className="text-sm text-muted-foreground">お席番号</p>
              <p className="mt-1 text-3xl font-bold tracking-wide">{tableId}</p>
            </div>

            <div className="space-y-2 text-center">
              <p className="text-sm text-muted-foreground">
                ご注文はお客様のスマートフォンから行えます。
              </p>
              <p className="text-sm text-muted-foreground">
                下のボタンからメニュー画面へお進みください。
              </p>
            </div>

            <Button asChild className="h-11 w-full rounded-xl text-base">
              <Link href={`/customer/${tableId}/menu`}>
                注文を始める
              </Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    </main>
  );
}