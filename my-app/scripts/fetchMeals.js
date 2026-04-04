const fs = require('fs');
const https = require('https');

function fetchMeal() {
  return new Promise((resolve, reject) => {
    https.get('https://www.themealdb.com/api/json/v1/1/random.php', (res) => {
      let data = '';
      res.on('data', (chunk) => {
        data += chunk;
      });
      res.on('end', () => {
        try {
          const meal = JSON.parse(data).meals[0];
          resolve({
            id: meal.idMeal,
            name: meal.strMeal,
            imageUrl: meal.strMealThumb,
            category: meal.strCategory || 'uncategorized',
            area: meal.strArea || 'unknown',
          });
        } catch (error) {
          reject(error);
        }
      });
    }).on('error', reject);
  });
}

async function fetchMeals(count = 20) {
  const meals = [];
  console.log(`Fetching ${count} random meals from TheMealDB...`);
  
  for (let i = 0; i < count; i++) {
    try {
      const meal = await fetchMeal();
      meals.push(meal);
      console.log(`✓ ${i + 1}/${count} - ${meal.name} (${meal.category}, ${meal.area})`);
      // Rate limiting to avoid overwhelming the API
      await new Promise(resolve => setTimeout(resolve, 300));
    } catch (error) {
      console.error(`✗ Error fetching meal ${i + 1}:`, error.message);
    }
  }
  
  // Remove duplicates by id
  const uniqueMeals = Array.from(new Map(meals.map(m => [m.id, m])).values());
  
  console.log(`\nFetched ${uniqueMeals.length} unique meals`);
  
  // Save to file
  const outputPath = './scripts/meals-data.json';
  fs.writeFileSync(outputPath, JSON.stringify(uniqueMeals, null, 2));
  console.log(`✓ Saved to ${outputPath}`);
  
  // Also print to console in a formatted way
  console.log('\n=== Meals Data ===');
  console.log(JSON.stringify(uniqueMeals, null, 2));
}

fetchMeals(20);
