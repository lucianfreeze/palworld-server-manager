const sqlite3 = require('sqlite3').verbose();
const bcrypt = require('bcrypt');
const User = require('./User');

class DatabaseManager {
    // implement the below methods as part of the DatabaseManager class
    static instance = null;
    constructor() {
        if (DatabaseManager.instance) {
            console.log('DatabaseManager instance already exists');
            return DatabaseManager.instance;
        }
        this.sqliteDB = new sqlite3.Database('./palworld.db', sqlite3.OPEN_READWRITE | sqlite3.OPEN_CREATE, (err) => {
            if (err) {
                console.error(err.message);
                throw err;
            } else {
                console.log('Connected to the SQLite database.');
                this.init();
                console.log(this);
            }
        });
        DatabaseManager.instance = this;
    }

    // Method to initialize the database
    async init() {
        try {
            // Function to create the users table if it doesn't exist
            let createUsersTable = () => {
                const sql = `
                    CREATE TABLE IF NOT EXISTS users (
                        id INTEGER PRIMARY KEY AUTOINCREMENT,
                        first_name TEXT,
                        last_name TEXT,
                        email NOT NULL UNIQUE,
                        password TEXT NOT NULL,
                        is_admin BOOLEAN DEFAULT 0
                    )
                `;

                this.sqliteDB.run(sql, (err) => {
                    if (err) {
                        console.error(err.message);
                    } else {
                        console.log('Users table created successfully');
                    }
                });
            }

            // Function to insert a new user
            let insertInitUser = () => {
                return new Promise(async (resolve, reject) => {
                    const hashedPassword = await bcrypt.hash("PalWorldAdminPassword", 10);
                    const sql = `INSERT or IGNORE INTO users (first_name, last_name, email, password, is_admin) VALUES ("Lucian", "Freeze", "lucianfreeze@gmail.com", "${hashedPassword}", 1)`;
                    this.sqliteDB.run(sql, (err) => {
                        if (err) {
                            console.error(err.message);
                            reject(err);
                        } else {
                            console.log('User inserted successfully');
                            resolve();
                        }
                    });
                });
            }

            // Usage
            createUsersTable();
            await insertInitUser();
        }
        catch (err) {
            console.error(err.message);
        }
    }

    // Method to create a new record in the database
    create(tableName, data) {
        const fields = Object.keys(data);
        const values = Object.values(data);
        const placeholders = fields.map((field, index) => `$${index + 1}`).join(',');
        const sql = `INSERT INTO ${tableName} (${fields.join(',')}) VALUES (${placeholders})`;
        return this.sqliteDB.run(sql, values);
    }

    // Method to read records from the database
    async read(tableName, where = '', values = []) {
        let sql = `SELECT * FROM ${tableName}`;
        if (where) {
            sql += ` WHERE ${where}`;
        }
        console.log(sql);
        console.log(where);
        console.log(values);

        return await new Promise((resolve, reject) => {
            this.sqliteDB.all(sql, values, (err, rows) => {
                if (err) {
                    console.error(err.message);
                    reject(err);
                } else {
                    console.log(rows);
                    resolve(rows);
                }
            });
        });
    }

    // Method to find a record by id
    async find(tableName, id) {
        const sql = `SELECT * FROM ${tableName} WHERE id = ?`;
        return await new Promise((resolve, reject) => {
            this.sqliteDB.get(sql, [id], (err, rows) => {
                if (err) {
                    console.error(err.message);
                    reject(err);
                } else {
                    console.log(rows);
                    resolve(rows);
                }
            });
        });
    }

    // Method to update a record in the database
    update(tableName, id, data) {
        const fields = Object.keys(data);
        const values = Object.values(data);
        const placeholders = fields.map((field, index) => `${field} = $${index + 1}`).join(',');
        const sql = `UPDATE ${tableName} SET ${placeholders} WHERE id = $${fields.length + 1}`;
        return this.sqliteDB.run(sql, [...values, id]);
    }

    // Method to delete a record from the database
    delete(tableName, id) {
        const sql = `DELETE FROM ${tableName} WHERE id = ?`;
        return this.sqliteDB.run(sql, [id]);
    }

    // Method to close the database connection
    close() {
        console.log('Closing the database connection');
        this.sqliteDB.close();
    }
}

const db = new DatabaseManager();
module.exports = db;