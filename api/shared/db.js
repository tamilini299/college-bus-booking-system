import sql from 'mssql';

let sharedPool = null;

export async function getPool() {
  if (sharedPool && sharedPool.connected) {
    return sharedPool;
  }

  // Works for both local and Azure
  const connStr = process.env.SQLAZURECONNSTR_CollegeBus || process.env.SQL_CONNECTION_STRING;

  if (!connStr) {
    throw new Error('❌ SQL connection string not set in environment variables');
  }

  try {
    sharedPool = await new sql.ConnectionPool(connStr).connect();
    console.log("✅ Connected to Azure SQL Database successfully!");
  } catch (err) {
    console.error("❌ Database connection failed:", err.message);
    throw err;
  }

  return sharedPool;
}

export async function query(queryText, params = {}) {
  const pool = await getPool();
  const request = pool.request();

  for (const [key, value] of Object.entries(params)) {
    request.input(key, value);
  }

  const result = await request.query(queryText);
  return result.recordset;
}

export { sql };
