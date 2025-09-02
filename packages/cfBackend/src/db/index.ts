import { drizzle } from "drizzle-orm/d1";
import * as schema from "./schema";

// Create Drizzle instance with D1 adapter
export function createDatabase(d1: D1Database) {
	return drizzle(d1, { schema });
}

// Export schema for use in other files
export * from "./schema";

// Export types
export type Database = ReturnType<typeof createDatabase>;
