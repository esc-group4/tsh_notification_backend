import request from 'supertest';
import express from 'express';
import router from '../routes/staffRoutes.js';
import * as db from '../models/db.js';
// import { Staff, insertOne, findOneByName, sync } from '../models/staff.js';
import * as staffModel from '../models/staff.js';

// Mock the db module
jest.mock('../models/db.js', () => ({
    pool: {
        query: jest.fn()
    },
    cleanup: jest.fn()
}));

// Create an express application for testing
const app = express();
app.use(express.json());
app.use('/staff', router);

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

describe('Staff Routes', () => {

    beforeAll(async () => {
        await setup();
    });
    
    afterAll(async () => {
        await teardown();
        await db.cleanup();
    });

    describe('GET /staff/all', () => {
        it('should retrieve all staff records', async () => {
            const staff1 = new staffModel.Staff('John Doe', 'sub1');
            const staff2 = new staffModel.Staff('Jane Smith', 'sub2');

            db.pool.query
                .mockResolvedValueOnce([[]])  // Mock findOneByName returning empty
                .mockResolvedValueOnce([[]])  // Mock insertOne
                .mockResolvedValueOnce([[{ name: 'John Doe', subscription: 'sub1' }]])  // Mock findOneByName returning inserted staff
                .mockResolvedValueOnce([[{ name: 'Jane Smith', subscription: 'sub2' }]])  // Mock findOneByName returning inserted staff
                .mockResolvedValueOnce([[{ name: 'John Doe', subscription: 'sub1' }, { name: 'Jane Smith', subscription: 'sub2' }]]);  // Mock all staff

            await staffModel.insertOne(staff1);
            await staffModel.insertOne(staff2);

            const response = await request(app).get('/staff/all');
            expect(response.status).toBe(200);
            const staffs = JSON.parse(response.text);
            expect(staffs).toEqual([
                { name: 'John Doe', subscription: 'sub1' },
                { name: 'Jane Smith', subscription: 'sub2' }
            ]);
        });
    });


    describe('GET /staff/submit/:name/:id', () => {
        it('should insert a new staff record and return all staff', async () => {
            const newStaff = new staffModel.Staff('John Doe', 'sub1');
            
            jest.spyOn(staffModel, 'insertOne').mockImplementationOnce(async (staff) => {
                const exists = await staffModel.findOneByName(staff.name);
                if (exists.length === 0) {
                    await db.pool.query(`INSERT INTO staff (name, subscription) VALUES (?, ?)`, [staff.name, staff.subscription]);
                } else {
                    console.error("User is already registered.");
                }
            });

            jest.spyOn(staffModel, 'findOneByName').mockResolvedValueOnce([]); // Mock findOneByName returning empty
            jest.spyOn(staffModel, 'findOneByName').mockResolvedValueOnce([newStaff]); // Mock findOneByName returning inserted staff
            jest.spyOn(staffModel, 'all').mockResolvedValueOnce([newStaff]); // Mock all returning the list of staff

            const response = await request(app).get('/staff/submit/John Doe/sub1');
            expect(response.status).toBe(200);

            const staffs = response.body;
            expect(staffs).toEqual([
                { name: 'John Doe', subscription: 'sub1' }
            ]);

            const insertedStaff = await staffModel.findOneByName('John Doe');
            expect(insertedStaff).toEqual([newStaff]);
        });


        it('should handle errors when inserting a new staff record', async () => {
            jest.spyOn(staffModel, 'insertOne').mockImplementationOnce(() => {
                throw new Error('Database error');
            });

            const response = await request(app).get('/staff/submit/John Doe/sub1');
            expect(response.status).toBe(500);
            expect(response.body).toEqual({
                message: "Internal Server Error",
                error: "Database error"
            });

            jest.restoreAllMocks();
        });
    });
});
