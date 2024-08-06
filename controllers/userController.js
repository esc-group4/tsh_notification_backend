// import axios from 'axios';

// const API_KEY = "MmE3NDY2ZWQtYmMxZi00ZDczLWIxYTYtNDQ2YjVkZmE2OTEx";
// const ONE_SIGNAL_APP_ID = "4b7035fa-afda-4657-ab5f-033b8408a9a1";
// // const API_KEY = "ODk5NDUzNjUtMzBkZS00ZTNiLWE3YWUtMWY5M2JhNWRiN2Iy";
// // const ONE_SIGNAL_APP_ID = "39dc6c84-8625-4449-bfd2-db8c9b58e9f0";

// // To be removed in final, just for checking
// export default async function getRecentUser(req, res) {
//   try {
//         const response = await axios.get(`https://onesignal.com/api/v1/players?app_id=${ONE_SIGNAL_APP_ID}`, {
//             headers: {
//                 'Authorization': `Basic ${API_KEY}`,
//                 'Content-Type': 'application/json; charset=utf-8'
//             }
//         });

//         const length = response.data.players.length;
//         const recent = response.data.players[length-1].id;
//         // return recent
//         res.json({ recent });
//     } catch (error) {
//         console.error('Error fetching recent subscriptions:', error.response ? error.response.data : error.message);
//         res.status(500).json({ message: 'Error fetching recent subscriptions', error: error.message });
//         //throw error;
//     }
// };
