import { pingDatabase } from '../data/database.js';

async function main() {
  try {
    const ok = await pingDatabase();
    if (ok) {
      console.log('Database connection successful (SELECT 1)');
      process.exit(0);
    }

    console.error('Connected to database, but ping did not return expected result');
    process.exit(1);
  } catch (error) {
    console.error('Could not connect to the database:');
    console.error(error.message);
    process.exit(1);
  }
}

main();
