import cron from 'node-cron';
import { scheduleNotification } from '../controllers/notificationController.js'; // Adjust the path if necessary
import { getCourseDetails } from '../controllers/getCourse.js';
import { findOneByName } from '../models/staff.js';
import { sendNotification } from '../controllers/notificationController.js';

// Mock the dependencies
jest.mock('../controllers/getCourse.js', () => ({
    getCourseDetails: jest.fn()
}));

jest.mock('../models/staff.js', () => ({
    findOneByName: jest.fn()
}));

jest.mock('../controllers/notificationController.js', () => ({
    sendNotification: jest.fn(),
    scheduleNotification: jest.fn()
}));

jest.mock('node-cron', () => ({
    schedule: jest.fn()
}));

describe('scheduleNotification', () => {
    beforeEach(() => {
        jest.resetAllMocks();
    });

    test('should schedule notifications successfully', async () => {
        // Mock data
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
        sendNotification.mockResolvedValue({ data: 'Notification sent' });
        cron.schedule.mockImplementation((cronExpression, callback) => {
            callback(); // Immediately call the callback for testing
            return { stop: jest.fn() }; // Mock the stop method
        });

        // Create mock request and response objects
        const req = {};
        const res = {
            status: jest.fn().mockReturnThis(),
            send: jest.fn(),
        };

        await scheduleNotification(req, res);
        console.log('getCourseDetails calls:', getCourseDetails.mock.calls);

        expect(getCourseDetails).toHaveBeenCalled();
        expect(findOneByName).toHaveBeenCalled();
        expect(sendNotification).toHaveBeenCalledWith('John Doe', 'some-player-id', 'First Aid', '2024-11-01T10:00:00Z');
        expect(res.send).toHaveBeenCalledWith('All notifications sent successfully');
    });

    test('should handle errors when fetching courses', async () => {
        // Mock error
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

    test('should handle errors when sending notifications', async () => {
        // Mock data
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
        const mockSendNotification = jest.fn().mockRejectedValue(new Error('Failed to send notification'));

        // Mock the implementations
        getCourseDetails.mockResolvedValue(mockCourseDetails);
        findOneByName.mockResolvedValue(mockStaff);
        sendNotification.mockImplementation(mockSendNotification);
        cron.schedule = jest.fn();

        // Create mock request and response objects
        const req = {};
        const res = {
            status: jest.fn().mockReturnThis(),
            send: jest.fn(),
        };

        await scheduleNotification(req, res);

        expect(getCourseDetails).toHaveBeenCalled();
        expect(findOneByName).toHaveBeenCalledWith('John Doe');
        expect(mockSendNotification).toHaveBeenCalledWith('John Doe', 'some-player-id', 'First Aid', '2024-11-01T10:00:00Z');
        expect(res.status).toHaveBeenCalledWith(500);
        expect(res.send).toHaveBeenCalledWith({
            message: 'Some notifications could not be scheduled',
            errors: [{ name: 'John Doe', error: 'Failed to send notification' }]
        });
    });
});
