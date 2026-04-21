import { neon } from "@neondatabase/serverless";

const DATABASE_URL = process.env.DATABASE_URL;

if (!DATABASE_URL) {
	console.error("DATABASE_URL environment variable is required");
	process.exit(1);
}

const sql = neon(DATABASE_URL);

async function initDb() {
	try {
		await sql`CREATE EXTENSION IF NOT EXISTS "pgcrypto"`;

		await sql`
      CREATE TABLE IF NOT EXISTS "User" (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        passphrase TEXT UNIQUE NOT NULL,
        "createdAt" TIMESTAMP NOT NULL DEFAULT NOW()
      )
    `;

		await sql`
      CREATE TABLE IF NOT EXISTS "Feed" (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        url TEXT NOT NULL,
        "userId" UUID NOT NULL REFERENCES "User"(id) ON DELETE CASCADE,
        "createdAt" TIMESTAMP NOT NULL DEFAULT NOW(),
        UNIQUE ("userId", url)
      )
    `;

		console.log("Database initialized successfully");
	} catch (error) {
		console.error("Failed to initialize database:", error);
		process.exit(1);
	}
}

initDb();
