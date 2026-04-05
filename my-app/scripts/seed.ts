import 'dotenv/config';
import { db } from '../lib/db';
import { menuItems, orders, staff } from '../lib/db/schema';
import { allDishes } from '../types/menu';

const fallbackImage = 'https://via.placeholder.com/512x384?text=No+Image';
const databaseUrl = process.env.DATABASE_URL || 'DATABASE_URL is not set';

const fallbackDescription = (name: string) => `${name} のおすすめ料理です。`;

const staffSeed = [
  { name: 'Aiko', email: 'aiko@osaki-cafe.local', role: 'manager', isActive: true },
  { name: 'Hiro', email: 'hiro@osaki-cafe.local', role: 'chef', isActive: true },
  { name: 'Mina', email: 'mina@osaki-cafe.local', role: 'server', isActive: true },
];

const orderSeed = [
  {
    tableId: 'A1',
    status: 'pending',
    totalPrice: 2240,
    orderItems: [
      { name: 'Moussaka', quantity: 1, price: 1300 },
      { name: 'Hummus', quantity: 1, price: 650 },
      { name: 'Timbits', quantity: 1, price: 290 },
    ],
  },
  {
    tableId: 'B4',
    status: 'confirmed',
    totalPrice: 1850,
    orderItems: [
      { name: 'Turkey Bánh mì', quantity: 1, price: 1100 },
      { name: 'Crema Catalana', quantity: 1, price: 680 },
      { name: 'Challah', quantity: 1, price: 70 },
    ],
  },
];

async function seedDatabase() {
  try {
    console.log('Starting database seeding...');
    console.log('Using DATABASE_URL:', databaseUrl);

    console.log('Clearing existing data...');
    await db.delete(orders);
    await db.delete(staff);
    await db.delete(menuItems);

    console.log('Inserting new menu items...');
    const menuSeedData = allDishes.map(item => ({
      name: item.name,
      price: item.price ?? 880,
      description: item.description || fallbackDescription(item.name),
      category: item.category || 'main',
      imageUrl: item.imageUrl || fallbackImage,
      isAvailable: item.isAvailable ?? true,
      isPopular: item.isPopular ?? false,
      area: item.area || 'International',
    }));

    const menuResult = await db.insert(menuItems).values(menuSeedData).returning();
    console.log(`✓ Seeded ${menuResult.length} menu items successfully`);

    console.log('Inserting staff data...');
    const staffResult = await db.insert(staff).values(staffSeed).returning();
    console.log(`✓ Seeded ${staffResult.length} staff members successfully`);

    console.log('Inserting sample orders...');
    const ordersResult = await db
      .insert(orders)
      .values(orderSeed.map(order => ({
        ...order,
        orderItems: order.orderItems,
      })))
      .returning();
    console.log(`✓ Seeded ${ordersResult.length} orders successfully`);

    const allMenuItems = await db.select().from(menuItems);
    console.log(`✓ Total menu items in database: ${allMenuItems.length}`);

    const categories = ['salad', 'main', 'side', 'dessert'];
    categories.forEach(category => {
      const count = allMenuItems.filter(item => item.category === category).length;
      console.log(`  - ${category}: ${count} items`);
    });

  } catch (error) {
    const errorDetails = error as { message?: string; code?: string; cause?: unknown };
    console.error('Error seeding database:', error);
    console.error('Error details:', {
      message: errorDetails.message,
      code: errorDetails.code,
      cause: errorDetails.cause,
    });
    process.exit(1);
  }
}

seedDatabase().then(() => {
  console.log('Database seeding completed');
  process.exit(0);
});
