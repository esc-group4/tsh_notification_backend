import express from 'express';
import * as staffModel from '../models/staff.js';
import axios from 'axios';
const router = express.Router();

// AJAX end points

router.get('/all', async function(req, res, next) {
    const staffs = await staffModel.all();
    console.log("no error to get all staff", staffs);
    // res.set('Access-Control-Allow-Origin', 'http://localhost:3000');
    res.send(`${JSON.stringify(staffs)}`);
});


// Change to post!! to connect to frontend
router.get('/submit/:name', async function(req, res, next) {
    console.log("submit point reached");
    try {
        const { name } = req.params;
        console.log("point reached");
        // Make an API call to obtain the code
        const response = await axios.get('http://localhost:3001/get/user');
        console.log(response.data);
        const subscription = response.data.recent;
        console.log(subscription);
        await staffModel.insertOne(staffModel.Staff.newStaff(name, subscription));
        const staffs = await staffModel.all();
        // res.set('Access-Control-Allow-Origin', 'http://localhost:3000');
        res.json(staffs);
    } catch (error){
        res.status(500).json({ message: "Internal Server Error", error: error.message });
    }
});

router.get('/', async function(req, res, next) {});

export default router;
