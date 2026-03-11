import path from "node:path";
import Database from "better-sqlite3";
import bcrypt from "bcryptjs";

function printUsage() {
  console.log("Usage:");
  console.log("  npm run admin:bootstrap -- --email you@example.com [--password your-password]");
  console.log("");
  console.log("Behavior:");
  console.log("  - If user exists: promotes to admin");
  console.log("  - If user does not exist: creates admin (requires --password)");
}

function parseArgs(argv) {
  const args = {};
  for (let i = 0; i < argv.length; i += 1) {
    const key = argv[i];
    const value = argv[i + 1];
    if (!key.startsWith("--")) continue;
    const normalizedKey = key.slice(2);
    if (!value || value.startsWith("--")) {
      args[normalizedKey] = true;
      continue;
    }
    args[normalizedKey] = value;
    i += 1;
  }
  return args;
}

async function main() {
  const args = parseArgs(process.argv.slice(2));

  if (args.help) {
    printUsage();
    process.exit(0);
  }

  const email = typeof args.email === "string" ? args.email.trim().toLowerCase() : "";
  const password = typeof args.password === "string" ? args.password : "";

  if (!email) {
    console.error("Error: --email is required.");
    printUsage();
    process.exit(1);
  }

  const dbPath = path.join(process.cwd(), "users.db");
  const db = new Database(dbPath);

  db.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id          INTEGER PRIMARY KEY AUTOINCREMENT,
      email       TEXT    NOT NULL UNIQUE,
      password    TEXT    NOT NULL,
      role        TEXT    NOT NULL DEFAULT 'user',
      created_at  TEXT    NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now'))
    )
  `);

  try {
    db.exec("ALTER TABLE users ADD COLUMN role TEXT NOT NULL DEFAULT 'user'");
  } catch {
    // Ignore if column already exists.
  }

  const existing = db.prepare("SELECT id, email, role FROM users WHERE email = ?").get(email);

  if (existing) {
    db.prepare("UPDATE users SET role = 'admin' WHERE id = ?").run(existing.id);
    console.log(`Promoted existing user to admin: ${email}`);
    return;
  }

  if (!password) {
    console.error("Error: user does not exist, so --password is required to create an admin.");
    process.exit(1);
  }

  const hashed = await bcrypt.hash(password, 12);
  db.prepare("INSERT INTO users (email, password, role) VALUES (?, ?, 'admin')").run(email, hashed);
  console.log(`Created new admin user: ${email}`);
}

main().catch((err) => {
  console.error("Failed to bootstrap admin:", err);
  process.exit(1);
});
