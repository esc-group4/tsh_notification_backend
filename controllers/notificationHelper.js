// npm install axios
import axios from 'axios';
import cron from 'node-cron';
import { getCourseDetails } from './getCourse.js';
import { findOneByName } from '../models/staff.js';
// import { getCourseName, getCourseDate } from '../controllers/getCourse.js';

// for emailnotifier.kesug.com
// const API_KEY = "ODk5NDUzNjUtMzBkZS00ZTNiLWE3YWUtMWY5M2JhNWRiN2Iy";
// const ONE_SIGNAL_APP_ID = "39dc6c84-8625-4449-bfd2-db8c9b58e9f0";

// for local testing
const API_KEY = "MmE3NDY2ZWQtYmMxZi00ZDczLWIxYTYtNDQ2YjVkZmE2OTEx";
const ONE_SIGNAL_APP_ID = "4b7035fa-afda-4657-ab5f-033b8408a9a1";

// Function used by cron job to schedule notifications
export async function sendNotification(name, id, course, startdate) {
    const [date, time] = startdate.split('T');
    const [hour, minute, second] = time.split(':');
    const strmessage = `This is a message from TSH reminding ${name} to go for your course named ${course} at the start date ${date} at ${hour}:${minute}`;
    try {
        console.log(strmessage);
        // Format notification payload based on user data
        const notificationPayload = {
            app_id: ONE_SIGNAL_APP_ID,
            contents: { en: strmessage },
            include_player_ids: [id]
        };

        // Log the payload being sent
        // console.log('Notification payload:', JSON.stringify(notificationPayload, null, 2));

        // Send notification using Axios
        const response = await axios.post('https://onesignal.com/api/v1/notifications', notificationPayload, {
            headers: {
                'Content-Type': 'application/json; charset=utf-8',
                'Authorization': `Basic ${API_KEY}`
            }
        });
        // Log the response data
        console.log(`Notification sent to ${name}`);
        return response; // to check payload and headers in test
    } catch (error) {
        console.error('Error sending notification:', error.response ? error.response.data : error.message);
        throw error; // to check if error is caught in test
    }
}
