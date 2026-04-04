// types/menu.ts

export type Category = "food" | "drink" | "dessert";

export const categoryLabels: Record<Category, string> = {
  food: "フード",
  drink: "ドリンク",
  dessert: "デザート",
};

export type MenuItem = {
  id: string;
  name: string;
  price: number;
  category: Category;
  description?: string;
  imageUrl?: string;
  isAvailable: boolean;
};