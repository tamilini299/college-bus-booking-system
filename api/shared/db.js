import sql from 'mssql';

let sharedPool = null;

export async function getPool() {
  if (sharedPool && sharedPool.connected) {
    return sharedPool;
  }
  const connStr = process.env.SQL_CONNECTION_STRING;
  if (!connStr) {
    throw new Error('SQL_CONNECTION_STRING not set');
  }
  sharedPool = await new sql.ConnectionPool(connStr).connect();
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

