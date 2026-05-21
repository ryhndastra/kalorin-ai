const axios = require("axios");

// FUNGSI NEMBAK SPOONACULAR
const searchSpoonacular = async (query) => {
  try {
    const API_KEY = process.env.SPOONACULAR_API_KEY;
    if (!API_KEY) return [];

    const response = await axios.get(
      `https://api.spoonacular.com/recipes/complexSearch`,
      {
        params: {
          query: query,
          addRecipeNutrition: true,
          number: 5,
          apiKey: API_KEY,
        },
      }
    );

    return response.data.results.map((item) => {
      const nutrients = item.nutrition.nutrients;
      const getNutrient = (name) => {
        const found = nutrients.find((n) => n.name === name);
        return found ? Math.round(found.amount) : 0;
      };

      return {
        id: `sp_${item.id}`,
        name: item.title,
        image: item.image || "https://via.placeholder.com/150",
        calories: getNutrient("Calories"),
        proteins: getNutrient("Protein"),
        fat: getNutrient("Fat"),
        carbohydrate: getNutrient("Carbohydrates"),
        food_cluster: 0,
        source: "Spoonacular",
      };
    });
  } catch (error) {
    console.error("❌ Spoonacular API Error:", error.message);
    return [];
  }
};

// FUNGSI NEMBAK EDAMAM RECIPES
const searchEdamam = async (query) => {
  try {
    const APP_ID = process.env.EDAMAM_APP_ID;
    const APP_KEY = process.env.EDAMAM_APP_KEY;

    if (!APP_ID || !APP_KEY) return [];

    const response = await axios.get(
      `https://api.edamam.com/api/recipes/v2`,
      {
        params: {
          app_id: APP_ID,
          app_key: APP_KEY,
          q: query,
          from: 0,
          to: 5,
        },
      }
    );

    const hits = response.data.hits || [];
    
    return hits.map((item) => {
      const recipe = item.recipe;
      const totalNutrients = recipe.totalNutrients || {};

      return {
        id: `eda_${recipe.uri ? recipe.uri.split("_")[1] : Math.random().toString(36).substr(2, 9)}`,
        name: recipe.label || "Unknown Dish",
        image: recipe.image || "https://via.placeholder.com/150",
        calories: Math.round((recipe.calories || 0) / (recipe.yield || 1)),
        proteins: Math.round((totalNutrients.PROCNT?.quantity || 0) / (recipe.yield || 1)),
        fat: Math.round((totalNutrients.FAT?.quantity || 0) / (recipe.yield || 1)),
        carbohydrate: Math.round((totalNutrients.CHOCDF?.quantity || 0) / (recipe.yield || 1)),
        food_cluster: 0,
        source: "Edamam Recipes",
      };
    });
  } catch (error) {
    console.error("❌ Edamam API Error:", error.message);
    return [];
  }
};

// FUNGSI UTAMA 
const searchExternalFood = async (query) => {
  try {
    const [spoonacularResults, edamamResults] = await Promise.all([
      searchSpoonacular(query),
      searchEdamam(query),
    ]);

    return [...spoonacularResults, ...edamamResults];
  } catch (error) {
    console.error("❌ External Search Aggregator Error:", error);
    return [];
  }
};

module.exports = {
  searchExternalFood,
};