
const prisma = require("./prismaClient");

async function testPreferences() {
  try {
    const preferences = await prisma.userPreference.findMany();

    console.log("Database connection successful!");
    console.log("Preferences:", preferences);
  } catch (error) {
    console.error("Database error:", error);
  } finally {
    await prisma.$disconnect();
  }
}

testPreferences();
