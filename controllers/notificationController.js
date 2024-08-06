import cron from 'node-cron';
import { getCourseDetails } from './getCourse.js';
import { findOneByName } from '../models/staff.js';
import { sendNotification } from './notificationHelper.js';

export async function scheduleNotification(req, res) {
    try {
        const notif_to_be_scheduled = await getCourseDetails();
        let errors = [];

        for (const notification of notif_to_be_scheduled) {
            const { staff_name, startDate, course_name } = notification;
            const [date, time] = startDate.split('T');
            const [year, month, day] = date.split('-');
            const [hour, minute] = time.split(':');

            const staff = await findOneByName(staff_name);

            if (staff.length === 0) {
                console.log(`${staff_name} has not subscribed to push notifications, skipping.`);
                continue;
            }

            const id = staff[0].subscription;

            try {
                await sendNotification(staff_name, id, course_name, startDate);
                console.log(`Notification sent successfully for ${staff_name}.`);
            } catch (error) {
                console.error(`Error sending notification for ${staff_name}:`, error.message);
                errors.push({ name: staff_name, error: error.message });
            }
        }

        if (errors.length > 0) {
            res.status(500).send({ message: 'Some notifications could not be scheduled', errors });
        } else {
            res.send("All notifications scheduled successfully");
        }
    } catch (error) {
        res.status(500).send({ message: 'Error fetching courses to be scheduled', error: error.message });
    }
}

// // Schedule the task
// export async function scheduleNotification(req, res) {
//     try {
//         console.log("Fetching course details...");
//         const notif_to_be_scheduled = await getCourseDetails();
//         const currentYear = new Date().getFullYear();
//         let errors = [];
//         for (let i = 0; i < notif_to_be_scheduled.length; i++) {
//             try {
//                 const name = notif_to_be_scheduled[i].staff_name;
//                 const startdate = notif_to_be_scheduled[i].startDate;
//                 const course = notif_to_be_scheduled[i].course_name;
//                 // Splitting the date and time
//                 const [date, time] = startdate.split('T');
//                 const [year, month, day] = date.split('-');
//                 const [hour, minute] = time.split(':');
//                 const staff = await findOneByName(name);

//                 console.log("check staff ", staff);

//                 if (staff.length > 0) {
//                     const id = staff[0].subscription;
//                     const year_int = parseInt(year, 10);
//                     const job = cron.schedule(`${minute} ${hour} ${day} ${month} *`, async () => {
//                         if (currentYear >= year_int) {
//                             try {
//                                 await sendNotification(name, id, course, startdate);
//                                 console.log('Job stopped.');
//                                 job.stop();
//                             } catch (notificationError) {
//                                 console.error('Error sending notification:', notificationError.message);
//                                 errors.push({ name, error: notificationError.message });
//                             }
//                         } else {
//                             console.log('Scheduled year is in the past, skipping execution.');
//                         }
//                     });
//                 } else {
//                     console.log("Staff has not subscribed to push notification, skipping execution.");
//                 }
//             } catch (error) {
//                 console.error(`Error scheduling notification for ${notif_to_be_scheduled[i].staff_name}:`, error.message);
//                 errors.push({ name: notif_to_be_scheduled[i].staff_name, error: error.message });
//             }
//         }
//         if (errors.length > 0) {
//             res.status(500).send({ message: 'Some notifications could not be scheduled', errors });
//         } else {
//             res.send("All notifications sent successfully");
//         }
//     } catch (error) {
//         res.status(500).send({ message: 'Error fetching courses to be scheduled', error });
//     }
// }

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