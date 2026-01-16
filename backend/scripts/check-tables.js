const { Pool } = require('pg');

const pool = new Pool({
  host: '192.168.188.158',
  port: 5432,
  database: 'n8n_db',
  user: 'n8n_user',
  password: 'root',
});

async function checkTables() {
  try {
    const result = await pool.query(`
      SELECT tablename
      FROM pg_tables
      WHERE schemaname = 'public'
      ORDER BY tablename;
    `);

    console.log('\n=== Existing tables in database ===');
    result.rows.forEach(row => {
      console.log(`  - ${row.tablename}`);
    });

    console.log('\n=== Checking specific tables ===');
    const tables = ['workouts', 'exercises', 'sets', 'sleep_logs', 'weight_logs'];

    for (const table of tables) {
      const check = await pool.query(`
        SELECT EXISTS (
          SELECT FROM information_schema.tables
          WHERE table_schema = 'public'
          AND table_name = $1
        );
      `, [table]);

      const exists = check.rows[0].exists;
      console.log(`  ${table}: ${exists ? '✓ EXISTS' : '✗ NOT FOUND'}`);

      if (exists) {
        const columns = await pool.query(`
          SELECT column_name, data_type
          FROM information_schema.columns
          WHERE table_name = $1
          ORDER BY ordinal_position;
        `, [table]);

        console.log(`    Columns:`);
        columns.rows.forEach(col => {
          console.log(`      - ${col.column_name} (${col.data_type})`);
        });
      }
    }

    await pool.end();
  } catch (error) {
    console.error('Error:', error.message);
    process.exit(1);
  }
}

checkTables();
