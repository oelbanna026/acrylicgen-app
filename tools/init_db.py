import sqlite3
import os

DB_PATH = '../server/database.sqlite'

def init_db():
    print(f"Initializing database at {DB_PATH}...")
    
    # Ensure directory exists
    os.makedirs(os.path.dirname(DB_PATH), exist_ok=True)
    
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()
    
    # Enable foreign keys
    cursor.execute("PRAGMA foreign_keys = ON")
    
    # Users Table
    cursor.execute('''
    CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        email TEXT UNIQUE NOT NULL,
        password TEXT NOT NULL,
        name TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        plan TEXT DEFAULT 'free',
        credits INTEGER DEFAULT 5,
        subscription_status TEXT DEFAULT 'active',
        stripe_customer_id TEXT,
        role TEXT DEFAULT 'user'
    )
    ''')
    
    # Exports Table
    cursor.execute('''
    CREATE TABLE IF NOT EXISTS exports (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER,
        type TEXT,
        filename TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        cost INTEGER DEFAULT 1,
        FOREIGN KEY(user_id) REFERENCES users(id)
    )
    ''')
    
    # Payments Table
    cursor.execute('''
    CREATE TABLE IF NOT EXISTS payments (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER,
        amount REAL,
        currency TEXT,
        payment_method TEXT,
        status TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY(user_id) REFERENCES users(id)
    )
    ''')
    
    # Seed Admin User (Password: admin1317%%)
    # Hash: $2a$08$4pukbpPIfFQ5eP1x5G5Jlu7PpCyaEzpSYFePQ0U/kLm2CM8LWMK9u
    try:
        cursor.execute('''
        INSERT INTO users (email, password, name, role, plan, credits)
        VALUES (?, ?, ?, ?, ?, ?)
        ''', ('oelbanna026@gmail.com', '$2a$08$4pukbpPIfFQ5eP1x5G5Jlu7PpCyaEzpSYFePQ0U/kLm2CM8LWMK9u', 'System Admin', 'admin', 'business', -1))
        print("Admin user created: oelbanna026@gmail.com")
    except sqlite3.IntegrityError:
        print("Admin user already exists.")
        
    conn.commit()
    conn.close()
    print("Database initialization complete.")

if __name__ == '__main__':
    init_db()
