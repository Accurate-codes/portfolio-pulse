// import { neon } from "@neondatabase/serverless";

// const databaseUrl =
//   process.env.DATABASE_URL || process.env.POSTGRES_URL;

// if (!databaseUrl) {
//   throw new Error(
//     "DATABASE_URL or POSTGRES_URL environment variable is missing."
//   );
// }

// export const sql = neon(databaseUrl);

import { neon } from "@neondatabase/serverless";

const databaseUrl =
  process.env.DATABASE_URL ||
  process.env.POSTGRES_URL;

export const sql = databaseUrl
  ? neon(databaseUrl)
  : null;