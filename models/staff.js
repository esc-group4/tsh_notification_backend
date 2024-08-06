import * as db from './db.js';
const tableName = 'staff';

class Staff {
    constructor(name, subscription) {
        this.name = name;
        this.subscription = subscription;
    }

    static newStaff(name, subscription) {
        return new Staff(name, subscription);
    }
}

async function sync() {
    try {
        await db.pool.query(`
            CREATE TABLE IF NOT EXISTS ${tableName} (
                name VARCHAR(255) UNIQUE,
                subscription VARCHAR(255)
            )
        `);
    } catch (error) {
        console.error("Database connection failed:", error);
        throw error;
    }
}

async function all() {
    try {
        const [rows] = await db.pool.query(`SELECT name, subscription FROM ${tableName}`);
        return rows.map(row => new Staff(row.name, row.subscription));
    } catch (error) {
        console.error("Database query failed:", error);
        throw error;
    }
}

async function findOneByName(name) {
    try {
        const [rows] = await db.pool.query(`SELECT name, subscription FROM ${tableName} WHERE name = ?`, [name]);
        return rows.map(row => new Staff(row.name, row.subscription));
    } catch (error) {
        console.error("Database query failed:", error);
        throw error;
    }
}

// async function findByID(subscription) {
//     try {
//         const [rows] = await db.pool.query(`SELECT name, subscription FROM ${tableName} WHERE subscription = ?`, [subscription]);
//         return rows.map(row => new Staff(row.name, row.subscription));
//     } catch (error) {
//         console.error("Database query failed:", error);
//         throw error;
//     }
// }

async function insertOne(staff) {
    try {
        const exists = await findOneByName(staff.name);
        if (exists.length === 0) {
            await db.pool.query(`INSERT INTO ${tableName} (name, subscription) VALUES (?, ?)`, [staff.name, staff.subscription]);
            const [newStaff] = await findOneByName(staff.name);
        }
        else {
            console.error("User is already registered.");
        }
    } catch (error) {
        console.error("Database operation failed:", error);
        throw error;
    }
}

// async function insertMany(staffs) {
//     for (let staff of staffs) {
//         await insertOne(staff);
//     }
// }

async function deleteOne(staff) {
    try {
        await db.pool.query(`DELETE FROM ${tableName} WHERE name = ?`, [staff.name]);
    } catch (error) {
        console.error("Database operation failed:", error);
        throw error;
    }
}

export { Staff, all, findOneByName, sync, insertOne, deleteOne };
