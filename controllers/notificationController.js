// npm install axios
import axios from 'axios';

// for emailnotifier.kesug.com
// const API_KEY = "ODk5NDUzNjUtMzBkZS00ZTNiLWE3YWUtMWY5M2JhNWRiN2Iy";
// const ONE_SIGNAL_APP_ID = "39dc6c84-8625-4449-bfd2-db8c9b58e9f0";

// for local testing
const API_KEY = "MmE3NDY2ZWQtYmMxZi00ZDczLWIxYTYtNDQ2YjVkZmE2OTEx";
const ONE_SIGNAL_APP_ID = "4b7035fa-afda-4657-ab5f-033b8408a9a1";

export default async function sendNotification(req, res) {
    const { id, msg } = req.params;   
    const strmessage = String(msg);
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
        const response = await axios.post('https://onesignal.com/api/v1/notifications', notificationPayload, {
            headers: {
                'Content-Type': 'application/json; charset=utf-8',
                'Authorization': `Basic ${API_KEY}`
            }
        });

        const reply = response.data;
        // Log the response data
        console.log('Notification sent, notification id is:', reply);
        res.json({reply});
    } catch (error) {
        console.error('Error sending notification:', error.response ? error.response.data : error.message);
        res.status(500).json({ message: 'Error fetching recent subscriptions', error: error.message });
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