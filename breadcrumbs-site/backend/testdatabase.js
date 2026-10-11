const prisma = require("./prismaClient");

async function main() {
    const users = await prisma.user.findMany();

    console.log("Database connection successful!");
    console.log("Users:", users);
}

main()
    .catch((error) => {
        console.error("Database test failed:", error.message);
        process.exitCode = 1;
    })
    .finally(async () => {
        await prisma.$disconnect();
    });