// npm install axios
import axios from 'axios';
import cron from 'node-cron';
import getCourseDetails from './getCourse.js';
// import { getCourseName, getCourseDate } from '../controllers/getCourse.js';

// for emailnotifier.kesug.com
// const API_KEY = "ODk5NDUzNjUtMzBkZS00ZTNiLWE3YWUtMWY5M2JhNWRiN2Iy";
// const ONE_SIGNAL_APP_ID = "39dc6c84-8625-4449-bfd2-db8c9b58e9f0";

// for local testing
const API_KEY = "MmE3NDY2ZWQtYmMxZi00ZDczLWIxYTYtNDQ2YjVkZmE2OTEx";
const ONE_SIGNAL_APP_ID = "4b7035fa-afda-4657-ab5f-033b8408a9a1";

// Function used by cron job to schedule notifications
function sendNotification(name, id, course, startdate) {
    const [date, time] = startdate.split('T');
    const [hour, minute, second] = time.split(':');
    const strmessage = `This is a message from TSH reminding ${name} to go for you course named ${course} at the start date ${date} at ${hour}:${minute}`;
    try {
        console.log(strmessage);
        // Format notification payload based on user data
        const notificationPayload = {
            app_id: ONE_SIGNAL_APP_ID,
            contents: { en: strmessage },
            // included_segments: ["Active Subscriptions"],
            // filters: [
            //     { "field": "tag", "key": "employee", "relation": "=", "value": name }
            // ]
            include_player_ids: [id]
        };

        // Log the payload being sent
        // console.log('Notification payload:', JSON.stringify(notificationPayload, null, 2));

        // Send notification using Axios
        const response = axios.post('https://onesignal.com/api/v1/notifications', notificationPayload, {
            headers: {
                'Content-Type': 'application/json; charset=utf-8',
                'Authorization': `Basic ${API_KEY}`
            }
        });
        // Log the response data
        console.log(`Notification sent to ${name}`);
    } catch (error) {
        console.error('Error sending notification:', error.response ? error.response.data : error.message);
    }
}

// Schedule the task
export default async function scheduleNotification(req, res) {
    try {
        const notif_to_be_scheduled = await getCourseDetails();
        console.log(notif_to_be_scheduled);
        const currentYear = new Date().getFullYear();
        let errors = [];
        for (let i = 0; i < notif_to_be_scheduled.length; i++) {
            try {
                const name = notif_to_be_scheduled[i].staff_name;
                const startdate = notif_to_be_scheduled[i].startDate;
                const course = notif_to_be_scheduled[i].course_name;
                console.log(name, startdate, course);
                // Splitting the date and time
                const [date, time] = startdate.split('T');
                const [year, month, day] = date.split('-');
                const [hour, minute, second] = time.split(':');
                console.log(date, time, year, month, day);
                // TODO: NEED TO CHECK IF THERE IS EXISTING ID AND NAME MATCH in you database! 
                const id = "d493c70e-9845-4c66-8524-80742b616db1";
                const year_int = parseInt(year, 10);
                const job = cron.schedule(`${minute} ${hour} ${day} ${month} *`, () => {
                    // TODO: need to check for when to send notification. 3 days before/immediately
                    // Checks if the year of all notifications sent are either the currect year or in the future
                    if (currentYear >= year_int) {
                        sendNotification(name, id, course, startdate).then(() => {
                            // Stop the job after execution
                            job.stop();
                            console.log('Job stopped.');
                        });
                    } else {
                        console.log('Scheduled year is in the past, skipping execution.');
                    }
                });
            } catch (error) {
                console.error(`Error scheduling notification for ${notif_to_be_scheduled[i].staff_name}:`, error.message);
                errors.push({ name: notif_to_be_scheduled[i].staff_name, error: error.message });
            }
        }
        if (errors.length > 0) {
            res.status(500).send({ message: 'Some notifications could not be scheduled', errors });
        }
        else {
            res.send("All notifications sent successfully");
        }
    } catch (error) {
        res.status(500).send({ message: 'Error fetching courses to be scheduled', error });
    }
}

// // Function to test sendNotification
// async function testSendNotification() {
//     try {
//         const result = await sendNotification('d493c70e-9845-4c66-8524-80742b616db1', "hello");
//         // const result = await sendNotification(1, "hello");
//         console.log('Test result:', result);
//     } catch (error) {
//         console.error('Error in testSendNotification:', error);
//     }
// }

// testSendNotification();