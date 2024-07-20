// npm install axios
import axios from 'axios';

const API_KEY = "ODk5NDUzNjUtMzBkZS00ZTNiLWE3YWUtMWY5M2JhNWRiN2Iy";
const ONE_SIGNAL_APP_ID = "39dc6c84-8625-4449-bfd2-db8c9b58e9f0";

const sendNotification = async ()=> {
    try {
        // Format notification payload based on user data
        const notificationPayload = {
            app_id: ONE_SIGNAL_APP_ID,
            contents: { en: `Please be reminded to complete your First Aid course by 24/7/2024` },
            // include_player_ids: [user.onesignal_player_id] // Example of using OneSignal player_id
            included_segments: ["Active Subscriptions"]
        };

        // Send notification using Axios
        const response = await axios.post('https://api.onesignal.com/notifications', notificationPayload, {
            headers: {
                'Content-Type': 'application/json; charset=utf-8',
                'Authorization': `Basic ${API_KEY}`
            }
        });
        console.log(`Notification sent :D`, response.data);
    } catch (error) {
        console.error('Error sending notification:', error.response ? error.response.data : error.message);
    }
}

sendNotification();

