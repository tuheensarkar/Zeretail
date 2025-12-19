const path = require("path")
const Database = require("better-sqlite3")

const dbPath = process.env.DATABASE_FILE || path.join(__dirname, "..", "data", "app.db")
const db = new Database(dbPath)

db.pragma("journal_mode = WAL")

db.exec(`
CREATE TABLE IF NOT EXISTS customers (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT NOT NULL,
  createdAt TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS products (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL UNIQUE,
  category TEXT NOT NULL,
  price REAL NOT NULL,
  stock INTEGER NOT NULL,
  min_stock_level INTEGER DEFAULT 10,
  max_stock_level INTEGER DEFAULT 100,
  vendor TEXT,
  createdAt TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS orders (
  id TEXT PRIMARY KEY,
  customer TEXT NOT NULL,
  product TEXT NOT NULL,
  amount REAL NOT NULL,
  status TEXT NOT NULL,
  date TEXT NOT NULL,
  vendor TEXT,
  customer_type TEXT,
  category TEXT,
  createdAt TEXT NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_orders_date ON orders(date);
CREATE INDEX IF NOT EXISTS idx_orders_status ON orders(status);
CREATE INDEX IF NOT EXISTS idx_orders_product ON orders(product);
CREATE INDEX IF NOT EXISTS idx_orders_customer ON orders(customer);
`)

module.exports = db
