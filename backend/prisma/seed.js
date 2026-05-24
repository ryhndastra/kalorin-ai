const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();
const fs = require("fs");
const path = require("path");

async function main() {
  const jsonPath = path.join(__dirname, "../data/nutrition_data.json");

  if (!fs.existsSync(jsonPath)) {
    console.error(`Error: File tidak ditemukan di ${jsonPath}`);
    return;
  }

  const foodData = JSON.parse(fs.readFileSync(jsonPath, "utf-8"));

  console.log("Sedang memasukkan data makanan...");

  for (let food of foodData) {
    const foodPayload = {
      name: food.name,
      calories: food.calories,
      proteins: food.proteins,
      fat: food.fat,
      carbohydrate: food.carbohydrate,
      image: food.image,
      foodCluster: food.food_cluster,
    };

    await prisma.food.upsert({
      where: { id: food.id },
      update: foodPayload,
      create: {
        id: food.id,
        ...foodPayload,
      },
    });
  }

  console.log("Data berhasil dimasukkan! 🚀");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
