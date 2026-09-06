import mysql from "mysql2/promise";

export const db = mysql.createPool({
  host: process.env.DATABASE_HOST,
  port: Number(process.env.DATABASE_PORT || 3306),
  database: process.env.DATABASE_NAME,
  user: process.env.DATABASE_USER,
  password: process.env.DATABASE_PASSWORD,

  waitForConnections: true,
  connectionLimit: 5,
  queueLimit: 0,
});

export async function getDbConnection() {
  return db.getConnection();
}
