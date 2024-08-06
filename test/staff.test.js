import * as db from '../models/db.js';
import { Staff, all, findOneByName, sync, insertOne, deleteOne } from '../models/staff.js';

// Mock the db module
jest.mock('../models/db.js', () => ({
    pool: {
        query: jest.fn()
    }
}));

async function setup() {
    try {
        await db.pool.query(`
            CREATE TABLE IF NOT EXISTS staff (
                name VARCHAR(255) UNIQUE,
                subscription VARCHAR(255)
            )
        `);
        await db.pool.query(`DELETE FROM staff`);
    } catch (error) {
        console.error("Setup failed: " + error);
        throw error;
    }
}

async function teardown() {
    try {
        await db.pool.query(`DELETE FROM staff`);
    } catch (error) {
        console.error("Teardown failed: " + error);
        throw error;
    }
}

describe('Staff model', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    beforeAll(async () => {
        await setup();
    });

    afterAll(async () => {
        await teardown();
    });

    describe('sync', () => {
        it('should create the staff table if it does not exist', async () => {
            db.pool.query.mockResolvedValueOnce();

            await sync();

            expect(db.pool.query).toHaveBeenCalledWith(expect.stringContaining('CREATE TABLE IF NOT EXISTS staff'));
        });

        it('should handle database errors', async () => {
            const error = new Error('Database error');
            db.pool.query.mockRejectedValueOnce(error);

            await expect(sync()).rejects.toThrow(error);
        });
    });

    describe('all', () => {
        it('should return all staff records', async () => {
            const mockRows = [{ name: 'John Doe', subscription: 'sub1' }];
            db.pool.query.mockResolvedValueOnce([mockRows]);

            const result = await all();

            expect(result).toEqual([new Staff('John Doe', 'sub1')]);
            expect(db.pool.query).toHaveBeenCalledWith('SELECT name, subscription FROM staff');
        });

        it('should handle database errors', async () => {
            const error = new Error('Database error');
            db.pool.query.mockRejectedValueOnce(error);

            await expect(all()).rejects.toThrow(error);
        });
    });

    describe('findOneByName', () => {
        it('should return the staff record with the specified name', async () => {
            const mockRows = [{ name: 'John Doe', subscription: 'sub1' }];
            db.pool.query.mockResolvedValueOnce([mockRows]);

            const result = await findOneByName('John Doe');

            expect(result).toEqual([new Staff('John Doe', 'sub1')]);
            expect(db.pool.query).toHaveBeenCalledWith('SELECT name, subscription FROM staff WHERE name = ?', ['John Doe']);
        });

        it('should handle database errors', async () => {
            const error = new Error('Database error');
            db.pool.query.mockRejectedValueOnce(error);

            await expect(findOneByName('John Doe')).rejects.toThrow(error);
        });
    });

    describe('insertOne', () => {
        it('should insert a new staff record if it does not exist', async () => {
            db.pool.query.mockResolvedValueOnce([[]]); // Mock findOneByName returning empty
            db.pool.query.mockResolvedValueOnce(); // Mock insertOne
            db.pool.query.mockResolvedValueOnce([[{ name: 'John Doe', subscription: 'sub1' }]]); // Mock findOneByName returning inserted staff

            const newStaff = new Staff('John Doe', 'sub1');
            await insertOne(newStaff);

            expect(db.pool.query).toHaveBeenCalledWith('SELECT name, subscription FROM staff WHERE name = ?', ['John Doe']);
            expect(db.pool.query).toHaveBeenCalledWith('INSERT INTO staff (name, subscription) VALUES (?, ?)', ['John Doe', 'sub1']);
        });

        it('should not insert a new staff record if it already exists', async () => {
            const mockRows = [{ name: 'John Doe', subscription: 'sub1' }];
            db.pool.query.mockResolvedValueOnce([mockRows]); // Mock findOneByName returning existing staff

            const newStaff = new Staff('John Doe', 'sub1');
            await insertOne(newStaff);

            expect(db.pool.query).toHaveBeenCalledWith('SELECT name, subscription FROM staff WHERE name = ?', ['John Doe']);
            expect(db.pool.query).not.toHaveBeenCalledWith('INSERT INTO staff (name, subscription) VALUES (?, ?)', ['John Doe', 'sub1']);
        });

        it('should handle database errors', async () => {
            const error = new Error('Database error');
            db.pool.query.mockRejectedValueOnce(error);

            const newStaff = new Staff('John Doe', 'sub1');
            await expect(insertOne(newStaff)).rejects.toThrow(error);
        });
    });

    describe('deleteOne', () => {
        it('should delete the staff record with the specified name', async () => {
            db.pool.query.mockResolvedValueOnce();

            const staffToDelete = new Staff('John Doe', 'sub1');
            await deleteOne(staffToDelete);

            expect(db.pool.query).toHaveBeenCalledWith('DELETE FROM staff WHERE name = ?', ['John Doe']);
        });

        it('should handle database errors', async () => {
            const error = new Error('Database error');
            db.pool.query.mockRejectedValueOnce(error);

            const staffToDelete = new Staff('John Doe', 'sub1');
            await expect(deleteOne(staffToDelete)).rejects.toThrow(error);
        });
    });
});
