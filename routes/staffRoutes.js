import express from 'express';
import * as staffModel from '../models/staff.js';
const router = express.Router();

// AJAX end points

router.get('/all/', async function(req, res, next) {
    const staffs = await staffModel.all();
    // res.set('Access-Control-Allow-Origin', 'http://localhost:3000');
    res.send(`${JSON.stringify(staffs)}`);
});



router.post('/submit/', async function(req, res, next) {
    const name = req.body.name;
    // Make an API call to obtain the code
    const response = await axios.get('http://localhost:3000/get/user');
    // Assume the API response contains the code in the format { code: 'some-code' }
    const code = response.data.code;
    await staffModel.insertOne(staffModel.Staff.newStaff(name, code));
    const staffs = await staffModel.all();
    // res.set('Access-Control-Allow-Origin', 'http://localhost:3000');
    res.send(`${JSON.stringify(staffs)}`);
})

export default router;
