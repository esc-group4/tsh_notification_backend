import { scheduleNotification } from '../controllers/notificationController.js';
import { getCourseDetails } from '../controllers/getCourse.js';
import { findOneByName } from '../models/staff.js';
import cron from 'node-cron';
import * as notificationController from '../controllers/notificationController.js';

jest.mock('../controllers/getCourse.js');
jest.mock('../models/staff.js');
jest.mock('node-cron');

describe('scheduleNotification', () => {
    let mockReq, mockRes, mockDate;

    beforeEach(() => {
        jest.resetAllMocks();
        mockReq = {};
        mockRes = {
            status: jest.fn().mockReturnThis(),
            send: jest.fn(),
        };
        // mockDate = new Date('2024-08-05T00:00:00Z');
        // jest.spyOn(global, 'Date').mockImplementation(() => mockDate);
    });

    test('cron job should schedule notifications successfully', async () => {
        const mockCourseDetails = [            
        {
            "createdAt": "2024-07-28T09:04:00.676Z",
            "staff_name": "John Doe",
            "email": "hoxiaoyang@gmail.com",
            "startDate": '2024-11-01T10:00:00Z',
            "Location": "50373 Dee Ridge",
            "course_name": "First Aid",
            "hp_num": "89116194",
            "id": "1"
        }];

        getCourseDetails.mockResolvedValue(mockCourseDetails);
        findOneByName.mockResolvedValue([{ "name": "John Doe", subscription: "5f6a47aa-7b04-4a07-a5c6-ef2d0e0dd516" }]);

        await scheduleNotification(mockReq, mockRes);

        expect(getCourseDetails).toHaveBeenCalled();
        expect(findOneByName).toHaveBeenCalledWith('John Doe');
        expect(cron.schedule).toHaveBeenCalledWith('00 10 01 11 *', expect.any(Function));
        expect(mockRes.send).toHaveBeenCalledWith('All notifications sent successfully');

        // Now simulate the cron job execution
        // jest.spyOn(global, 'Date').mockImplementation(() => new Date('2024-11-01T10:00:00Z'));
        // await cronCallback();

        //expect(sendNotification).toHaveBeenCalledWith('John Doe', '5f6a47aa-7b04-4a07-a5c6-ef2d0e0dd516', 'First Aid', '2024-11-01T10:00:00Z');
    });
    
    test('should handle errors when cron is sending notifications', async () => {
        const mockCourseDetails = [
            {
                "createdAt": "2024-07-28T09:04:00.676Z",
                "staff_name": "John Doe",
                "email": "hoxiaoyang@gmail.com",
                "startDate": '2024-11-01T10:00:00Z',
                "Location": "50373 Dee Ridge",
                "course_name": "First Aid",
                "hp_num": "89116194",
                "id": "1"
            }
        ];

        const mockStaff = [{ "name": "John Doe", "subscription": "some-player-id" }];

        getCourseDetails.mockResolvedValue(mockCourseDetails);
        findOneByName.mockResolvedValue(mockStaff);

        // Simulate a network error naturally
        jest.spyOn(notificationController, 'sendNotification').mockImplementation(() => Promise.reject(new Error('Network Error')));

        let cronCallback;
        cron.schedule.mockImplementation((cronExpression, callback) => {
            cronCallback = callback;
            return { stop: jest.fn() };
        });

        await scheduleNotification(mockReq, mockRes);

        expect(getCourseDetails).toHaveBeenCalled();
        expect(findOneByName).toHaveBeenCalledWith('John Doe');

        // Verify that sendNotification was called and failed
        // expect(notificationController.sendNotification).toHaveBeenCalledWith('John Doe', 'some-player-id', 'First Aid', '2024-11-01T10:00:00Z');
        expect(notificationController.sendNotification).toHaveBeenCalledWith('John Doe', 'some-player-id', 'First Aid', '2024-11-01T10:00:00Z');
        expect(mockRes.status).toHaveBeenCalledWith(500);
        expect(cron.schedule).not.toHaveBeenCalled();
        // expect(mockRes.status).toHaveBeenCalledWith(500);
        expect(mockRes.send).toHaveBeenCalledWith({
            message: 'Some notifications could not be scheduled',
            errors: [{ name: 'John Doe', error: 'Failed to send notification' }]
        });
    });

    test('should handle errors when fetching courses', async () => {
        getCourseDetails.mockRejectedValue(new Error('Failed to fetch courses'));

        const req = {};
        const res = {
            status: jest.fn().mockReturnThis(),
            send: jest.fn(),
        };

        await scheduleNotification(req, res);

        expect(getCourseDetails).toHaveBeenCalled();
        expect(res.status).toHaveBeenCalledWith(500);
        expect(res.send).toHaveBeenCalledWith({
            message: 'Error fetching courses to be scheduled',
            error: expect.any(Error)
        });
    });

});
// import cron from 'node-cron';
// import { scheduleNotification } from '../controllers/notificationController.js';
// import { getCourseDetails } from '../controllers/getCourse.js';
// import { findOneByName } from '../models/staff.js';
// import { sendNotification } from '../controllers/notificationController.js';

// // Mock the dependencies
// jest.mock('../controllers/getCourse.js', () => ({
//     getCourseDetails: jest.fn()
// }));

// jest.mock('../models/staff.js', () => ({
//     findOneByName: jest.fn()
// }));

// jest.mock('../controllers/notificationController.js', () => {
//     const originalModule = jest.requireActual('../controllers/notificationController.js');
//     return {
//         ...originalModule,
//         sendNotification: jest.fn()
//     };
// });

// jest.mock('node-cron', () => ({
//     schedule: jest.fn()
// }));

// describe('scheduleNotification', () => {
//     beforeEach(() => {
//         jest.resetAllMocks();
//     });

//     test('should schedule notifications successfully', async () => {
//         const mockCourseDetails = [
//             {
//                 "createdAt": "2024-07-28T09:04:00.676Z",
//                 "staff_name": "John Doe",
//                 "email": "hoxiaoyang@gmail.com",
//                 "startDate": '2024-11-01T10:00:00Z',
//                 "Location": "50373 Dee Ridge",
//                 "course_name": "First Aid",
//                 "hp_num": "89116194",
//                 "id": "1"
//             }
//         ];

//         const mockStaff = [{ "name": "John Doe", "subscription": "5f6a47aa-7b04-4a07-a5c6-ef2d0e0dd516" }];
        
//         getCourseDetails.mockResolvedValue(mockCourseDetails);
//         findOneByName.mockResolvedValue(mockStaff);
//         sendNotification.mockResolvedValue({ data: 'Notification sent' });

//         // const jobStopMock = jest.fn();
//         // const jobPromise = new Promise((resolve) => {
//         //     cron.schedule.mockImplementation((cronExpression, callback) => {
//         //         callback(); // Immediately call the callback for testing
//         //         resolve(); // Resolve the promise when the callback is called
//         //         return { stop: jobStopMock };
//         //     });
//         // });
//         let cronCallback;
//         cron.schedule.mockImplementation((cronExpression, callback) => {
//             cronCallback = callback; // Store the callback to manually invoke it later
//             return { stop: jest.fn() }; // Mock the stop method
//         });

//         const req = {};
//         const res = {
//             status: jest.fn().mockReturnThis(),
//             send: jest.fn(),
//         };

//         await scheduleNotification(req, res);
//         await cronCallback(); // Wait for the cron job to complete

//         expect(getCourseDetails).toHaveBeenCalled();
//         expect(findOneByName).toHaveBeenCalledWith('John Doe');
//         expect(sendNotification).toHaveBeenCalledWith('John Doe', '5f6a47aa-7b04-4a07-a5c6-ef2d0e0dd516', 'First Aid', '2024-11-01T10:00:00Z');
//         expect(res.send).toHaveBeenCalledWith('All notifications sent successfully');
//         // expect(jobStopMock).toHaveBeenCalled();
//     });

//     test('should handle errors when sending notifications', async () => {
//         const mockCourseDetails = [
//             {
//                 "createdAt": "2024-07-28T09:04:00.676Z",
//                 "staff_name": "John Doe",
//                 "email": "hoxiaoyang@gmail.com",
//                 "startDate": '2024-11-01T10:00:00Z',
//                 "Location": "50373 Dee Ridge",
//                 "course_name": "First Aid",
//                 "hp_num": "89116194",
//                 "id": "1"
//             }
//         ];

//         const mockStaff = [{ "name": "John Doe", "subscription": "some-player-id" }];
//         const mockSendNotification = jest.fn().mockRejectedValue(new Error('Failed to send notification'));

//         getCourseDetails.mockResolvedValue(mockCourseDetails);
//         findOneByName.mockResolvedValue(mockStaff);
//         sendNotification.mockImplementation(mockSendNotification);

//         const jobStopMock = jest.fn();
//         const jobPromise = new Promise((resolve) => {
//             cron.schedule.mockImplementation((cronExpression, callback) => {
//                 callback(); // Immediately call the callback for testing
//                 resolve(); // Resolve the promise when the callback is called
//                 return { stop: jobStopMock };
//             });
//         });

//         const req = {};
//         const res = {
//             status: jest.fn().mockReturnThis(),
//             send: jest.fn(),
//         };

//         await scheduleNotification(req, res);
//         await jobPromise; // Wait for the cron job to complete

//         expect(getCourseDetails).toHaveBeenCalled();
//         expect(findOneByName).toHaveBeenCalledWith('John Doe');
//         expect(mockSendNotification).toHaveBeenCalledWith('John Doe', 'some-player-id', 'First Aid', '2024-11-01T10:00:00Z');
//         expect(res.status).toHaveBeenCalledWith(500);
//         expect(res.send).toHaveBeenCalledWith({
//             message: 'Some notifications could not be scheduled',
//             errors: [{ name: 'John Doe', error: 'Failed to send notification' }]
//         });
//         expect(jobStopMock).toHaveBeenCalled();
//     });

//     test('should handle errors when fetching courses', async () => {
//         getCourseDetails.mockRejectedValue(new Error('Failed to fetch courses'));

//         const req = {};
//         const res = {
//             status: jest.fn().mockReturnThis(),
//             send: jest.fn(),
//         };

//         await scheduleNotification(req, res);

//         expect(getCourseDetails).toHaveBeenCalled();
//         expect(res.status).toHaveBeenCalledWith(500);
//         expect(res.send).toHaveBeenCalledWith({
//             message: 'Error fetching courses to be scheduled',
//             error: expect.any(Error)
//         });
//     });
// });
