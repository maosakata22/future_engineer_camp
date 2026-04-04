# Drizzle ORM Setup

このプロジェクトでは、Drizzle ORMを使用してPostgreSQLデータベースを操作しています。

## ディレクトリ構造

```
lib/db/
├── index.ts      # DB接続インスタンス
├── schema.ts     # データベーススキーマ定義
└── queries.ts    # クエリ関数

app/api/
├── menu/
│   └── route.ts  # メニューAPI
└── orders/
    ├── route.ts      # 注文API
    └── [id]/
        └── route.ts  # 個別注文API

scripts/
└── seed.ts       # データベース初期化スクリプト
```

## 設定ファイル

- `drizzle.config.ts` - Drizzle設定ファイル

## 使用方法

### 1. マイグレーションの生成

```bash
npx drizzle-kit generate
```

### 2. マイグレーションの実行

```bash
npx drizzle-kit migrate
```

### 3. データベースのシード

```bash
npx tsx scripts/seed.ts
```

### 4. Drizzle Studioでデータベースを確認

```bash
npx drizzle-kit studio
```

## API エンドポイント

### メニュー

- `GET /api/menu` - 全メニュー項目を取得
- `GET /api/menu?category=main` - カテゴリ別メニューを取得
- `GET /api/menu?popular=true` - 人気メニューを取得
- `POST /api/menu` - 新しいメニュー項目を作成

### 注文

- `GET /api/orders` - 全注文を取得（スタッフ用）
- `GET /api/orders?tableId=001` - テーブル別注文を取得
- `POST /api/orders` - 新しい注文を作成
- `GET /api/orders/[id]` - 特定の注文を取得
- `PUT /api/orders/[id]` - 注文ステータスを更新

## スキーマ

### menu_items テーブル

- `id` - プライマリキー
- `name` - メニュー名
- `price` - 価格
- `description` - 説明
- `category` - カテゴリ ('salad', 'main', 'drink', 'dessert', 'side')
- `imageUrl` - 画像URL
- `isAvailable` - 利用可能フラグ
- `isPopular` - 人気フラグ
- `area` - 料理の地域
- `createdAt` - 作成日時
- `updatedAt` - 更新日時

### orders テーブル

- `id` - プライマリキー
- `tableId` - テーブルID
- `status` - ステータス ('pending', 'confirmed', 'completed', 'cancelled')
- `totalPrice` - 合計金額
- `orderItems` - 注文アイテム（JSON）
- `createdAt` - 作成日時
- `updatedAt` - 更新日時