"use client";

import Link from "next/link";
import { Suspense, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { authClient } from "@/lib/auth-client";

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { data: session, isPending } = authClient.useSession();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const nextPath = searchParams.get("next") || "/staff";

  useEffect(() => {
    if (!isPending && session?.user) {
      router.replace(nextPath);
    }
  }, [isPending, nextPath, router, session]);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsSubmitting(true);
    setErrorMessage(null);

    const result = await authClient.signIn.email({
      email,
      password,
    });

    if (result.error) {
      setErrorMessage(result.error.message || "ログインに失敗しました。");
      setIsSubmitting(false);
      return;
    }

    router.replace(nextPath);
    router.refresh();
  };

  return (
    <Card className="w-full max-w-md rounded-3xl bg-white">
      <CardHeader className="space-y-2 text-center">
        <p className="text-sm font-medium text-muted-foreground">Staff Sign In</p>
        <CardTitle className="text-3xl font-black">従業員ログイン</CardTitle>
        <p className="text-sm text-muted-foreground">
          スタッフ画面の表示にはログインが必要です。
        </p>
      </CardHeader>

      <CardContent className="space-y-4">
        <form className="space-y-4" onSubmit={handleSubmit}>
          <div className="space-y-2">
            <label htmlFor="email" className="text-sm font-medium">
              メールアドレス
            </label>
            <Input
              id="email"
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              placeholder="staff@example.com"
              className="h-11 rounded-xl bg-white"
              required
            />
          </div>

          <div className="space-y-2">
            <label htmlFor="password" className="text-sm font-medium">
              パスワード
            </label>
            <Input
              id="password"
              type="password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              placeholder="********"
              className="h-11 rounded-xl bg-white"
              required
            />
          </div>

          {errorMessage ? (
            <div className="rounded-2xl border border-red-200 bg-red-50 p-3 text-sm text-red-700">
              {errorMessage}
            </div>
          ) : null}

          <Button type="submit" className="h-11 w-full rounded-xl" disabled={isSubmitting}>
            {isSubmitting ? "ログイン中..." : "ログイン"}
          </Button>
        </form>

        <div className="rounded-2xl bg-muted/50 p-4 text-sm text-muted-foreground">
          初回利用の場合は、スタッフ登録済みメールアドレスで
          <Link href="/register" className="ml-1 font-medium text-foreground underline">
            アカウント作成
          </Link>
          を行ってください。
        </div>
      </CardContent>
    </Card>
  );
}

export default function LoginPage() {
  return (
    <main className="flex min-h-dvh items-center justify-center bg-stone-100 px-4 py-10">
      <Suspense
        fallback={
          <Card className="w-full max-w-md rounded-3xl bg-white">
            <CardContent className="py-12 text-center text-sm text-muted-foreground">
              ログイン画面を読み込んでいます...
            </CardContent>
          </Card>
        }
      >
        <LoginForm />
      </Suspense>
    </main>
  );
}
