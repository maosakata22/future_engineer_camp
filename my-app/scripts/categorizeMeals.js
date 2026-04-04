const fs = require('fs');
const path = require('path');

// Load the meals data
const mealsDataPath = path.join(__dirname, 'meals-data.json');
const meals = JSON.parse(fs.readFileSync(mealsDataPath, 'utf-8'));

// Function to categorize meals
function categorizeMeal(meal) {
  const name = meal.name.toLowerCase();
  const category = meal.category.toLowerCase();
  const area = meal.area.toLowerCase();

  // Dessert
  if (category.includes('dessert') || 
      ['baklava', 'ensaimada', 'crema', 'tiramisu', 'timbits', 'dziriat', 'cake', 'pie'].some(word => name.includes(word))) {
    return 'dessert';
  }

  // Salad
  if (name.includes('salad') || name.includes('greek salad')) {
    return 'salad';
  }

  // Seafood - main
  if (category.includes('seafood')) {
    return 'main';
  }

  // Chicken - main
  if (category.includes('chicken')) {
    return 'main';
  }

  // Beef - main
  if (category.includes('beef')) {
    return 'main';
  }

  // Vegetarian - usually main
  if (category.includes('vegetarian')) {
    if (name.includes('sandwich') || name.includes('pita')) {
      return 'main';
    }
    return 'main'; // dal fry, omelette cake, etc.
  }

  // Side
  if (category.includes('side')) {
    return 'side';
  }

  // Miscellaneous - check the name
  if (name.includes('sandwich') || name.includes('bánh mì')) {
    return 'main';
  }

  // Default to main
  return 'main';
}

// Categorize all meals
const categorizedMeals = meals.map(meal => ({
  ...meal,
  dishCategory: categorizeMeal(meal),
}));

// Group by category
const grouped = {
  salad: [],
  main: [],
  side: [],
  dessert: [],
};

categorizedMeals.forEach(meal => {
  if (grouped[meal.dishCategory]) {
    grouped[meal.dishCategory].push(meal);
  }
});

// Print for review
console.log('=== Categorized Meals ===\n');
Object.entries(grouped).forEach(([category, items]) => {
  console.log(`\n${category.toUpperCase()} (${items.length}):`);
  items.forEach(item => {
    console.log(`  - ${item.name}`);
  });
});

// Create TypeScript file content
const dishesArray = categorizedMeals.map(meal => ({
  id: meal.id,
  name: meal.name,
  price: 0, // Price to be set manually
  description: `${meal.name} from ${meal.area}`,
  category: meal.dishCategory,
  imageUrl: meal.imageUrl,
  isAvailable: true,
  isPopular: false,
  area: meal.area,
}));

const tsContent = `export type DishCategory = "salad" | "main" | "side" | "dessert";

export interface MenuItem {
  id: string;
  name: string;
  price?: number;
  description?: string;
  category: DishCategory;
  imageUrl: string;
  isAvailable?: boolean;
  isPopular?: boolean;
  area?: string;
}

// Menu items fetched from TheMealDB API
export const allDishes: MenuItem[] = ${JSON.stringify(dishesArray, null, 2)};
`;

// Write to file
const outputPath = path.join(__dirname, '../types/dish.ts');
fs.writeFileSync(outputPath, tsContent);
console.log(`\n✓ TypeScript file saved to ${outputPath}`);

// Also save the raw categorized data as JSON
const jsonOutputPath = path.join(__dirname, 'meals-categorized.json');
fs.writeFileSync(jsonOutputPath, JSON.stringify(categorizedMeals, null, 2));
console.log(`✓ Categorized data saved to ${jsonOutputPath}`);
