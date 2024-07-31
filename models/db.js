import mysql from 'mysql2';

let pool = mysql
  .createPool({
    host: "localhost",
    user: "xiaoyang",
    database: "subscriptions",
    password: "xiaoyang",
    connectionLimit: 10,
  })
  .promise();

async function cleanup() {
    await pool.end();
}

export {pool, cleanup};