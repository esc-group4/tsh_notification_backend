import express from 'express';
import * as staffModel from '../models/staff.js';
import axios from 'axios';
const router = express.Router();

// AJAX end points

router.get('/all', async function(req, res, next) {
    const staffs = await staffModel.all();
    // res.set('Access-Control-Allow-Origin', 'http://localhost:3000');
    res.send(`${JSON.stringify(staffs)}`);
});


// Change to post!! to connect to frontend
router.get('/submit/:name/:id', async function(req, res, next) {
    try {
        const { name, id } = req.params;
        await staffModel.insertOne(staffModel.Staff.newStaff(name, id));
        const staffs = await staffModel.all();
        // res.set('Access-Control-Allow-Origin', 'http://localhost:3000');
        res.json(staffs);
    } catch (error){
        res.status(500).json({ message: "Internal Server Error", error: error.message });
    }
});

export default router;
