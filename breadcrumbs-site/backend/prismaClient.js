// Load environment variables from .env
require("dotenv").config();

// Import Prisma Client
const { PrismaClient } = require("@prisma/client");

// Import PostgreSQL adapter
const { PrismaPg } = require("@prisma/adapter-pg");

// Create PostgreSQL adapter using Supabase connection URL
const adapter = new PrismaPg({
    connectionString: process.env.DATABASE_URL
});

// Create Prisma Client
const prisma = new PrismaClient({
    adapter
});

// Export Prisma Client for other files
module.exports = prisma;