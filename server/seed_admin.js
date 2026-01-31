const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const bcrypt = require('bcryptjs');

const dbPath = path.resolve(__dirname, 'database.sqlite');
const db = new sqlite3.Database(dbPath);

const email = 'admin@example.com';
const password = '123456';
const hashedPassword = bcrypt.hashSync(password, 8);

db.serialize(() => {
    db.get(`SELECT id FROM users WHERE email = ?`, [email], (err, row) => {
        if (err) {
            console.error(err.message);
            db.close();
            return;
        }
        if (row) {
            console.log('Admin user already exists. Updating role to admin...');
            db.run(`UPDATE users SET role = 'admin', password = ? WHERE email = ?`, [hashedPassword, email], (err) => {
                if(err) console.error(err);
                else console.log("Admin user updated.");
                db.close();
            });
        } else {
            console.log('Creating admin user...');
            db.run(`INSERT INTO users (name, email, password, role, plan, credits) VALUES (?, ?, ?, ?, ?, ?)`, 
                ['Admin User', email, hashedPassword, 'admin', 'business', -1], 
                function(err) {
                    if (err) {
                        console.error(err.message);
                    } else {
                        console.log(`Admin user created with ID ${this.lastID}`);
                    }
                    db.close();
                }
            );
        }
    });
});
