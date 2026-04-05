"use client";

import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { authClient } from "@/lib/auth-client";

export default function StaffRegisterPage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsSubmitting(true);
    setErrorMessage(null);

    const result = await authClient.signUp.email({
      name,
      email,
      password,
    });

    if (result.error) {
      setErrorMessage(result.error.message || "アカウント作成に失敗しました。");
      setIsSubmitting(false);
      return;
    }

    router.replace("/staff");
    router.refresh();
  };

  return (
    <main className="flex min-h-dvh items-center justify-center bg-stone-100 px-4 py-10">
      <Card className="w-full max-w-md rounded-3xl bg-white">
        <CardHeader className="space-y-2 text-center">
          <p className="text-sm font-medium text-muted-foreground">Staff Registration</p>
          <CardTitle className="text-3xl font-black">従業員アカウント作成</CardTitle>
          <p className="text-sm text-muted-foreground">
            店舗に登録済みのスタッフメールアドレスのみ利用できます。
          </p>
        </CardHeader>

        <CardContent className="space-y-4">
          <form className="space-y-4" onSubmit={handleSubmit}>
            <div className="space-y-2">
              <label htmlFor="name" className="text-sm font-medium">
                表示名
              </label>
              <Input
                id="name"
                value={name}
                onChange={(event) => setName(event.target.value)}
                className="h-11 rounded-xl bg-white"
                required
              />
            </div>

            <div className="space-y-2">
              <label htmlFor="email" className="text-sm font-medium">
                メールアドレス
              </label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
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
                className="h-11 rounded-xl bg-white"
                minLength={8}
                required
              />
            </div>

            {errorMessage ? (
              <div className="rounded-2xl border border-red-200 bg-red-50 p-3 text-sm text-red-700">
                {errorMessage}
              </div>
            ) : null}

            <Button type="submit" className="h-11 w-full rounded-xl" disabled={isSubmitting}>
              {isSubmitting ? "登録中..." : "アカウント作成"}
            </Button>
          </form>

          <p className="text-center text-sm text-muted-foreground">
            すでにアカウントをお持ちの場合は
            <Link href="/login" className="ml-1 font-medium text-foreground underline">
              ログイン
            </Link>
          </p>
        </CardContent>
      </Card>
    </main>
  );
}
