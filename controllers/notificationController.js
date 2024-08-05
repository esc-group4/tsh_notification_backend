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

// Schedule the task
export async function scheduleNotification(req, res) {
    try {
        console.log("Fetching course details...");
        const notif_to_be_scheduled = await getCourseDetails();
        const currentYear = new Date().getFullYear();
        let errors = [];
        for (let i = 0; i < notif_to_be_scheduled.length; i++) {
            try {
                const name = notif_to_be_scheduled[i].staff_name;
                const startdate = notif_to_be_scheduled[i].startDate;
                const course = notif_to_be_scheduled[i].course_name;
                // Splitting the date and time
                const [date, time] = startdate.split('T');
                const [year, month, day] = date.split('-');
                const [hour, minute] = time.split(':');
                const staff = await findOneByName(name);

                console.log("check staff ", staff);

                if (staff.length > 0) {
                    const id = staff[0].subscription;
                    const year_int = parseInt(year, 10);
                    const job = cron.schedule(`${minute} ${hour} ${day} ${month} *`, async () => {
                        if (currentYear >= year_int) {
                            try {
                                await sendNotification(name, id, course, startdate);
                                console.log('Job stopped.');
                                job.stop();
                            } catch (notificationError) {
                                console.error('Error sending notification:', notificationError.message);
                                errors.push({ name, error: notificationError.message });
                            }
                        } else {
                            console.log('Scheduled year is in the past, skipping execution.');
                        }
                    });
                } else {
                    console.log("Staff has not subscribed to push notification, skipping execution.");
                }
            } catch (error) {
                console.error(`Error scheduling notification for ${notif_to_be_scheduled[i].staff_name}:`, error.message);
                errors.push({ name: notif_to_be_scheduled[i].staff_name, error: error.message });
            }
        }
        if (errors.length > 0) {
            res.status(500).send({ message: 'Some notifications could not be scheduled', errors });
        } else {
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