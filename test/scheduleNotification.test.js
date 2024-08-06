import { scheduleNotification } from '../controllers/notificationController.js';
import { getCourseDetails } from '../controllers/getCourse.js';
import { findOneByName } from '../models/staff.js';
import cron, { schedule } from 'node-cron';
import { sendNotification } from '../controllers/notificationHelper.js';

jest.mock('../controllers/getCourse.js');
jest.mock('../models/staff.js');
jest.mock('node-cron');
jest.mock('../controllers/notificationHelper.js');

describe('scheduleNotification', () => {
    let mockReq, mockRes, mockDate;

    beforeEach(() => {
        jest.resetAllMocks();
        jest.clearAllMocks();
        mockReq = {};
        mockRes = {
            status: jest.fn().mockReturnThis(),
            send: jest.fn(),
        };
    });

    afterEach(() => {
        jest.restoreAllMocks();
    });

    test('should schedule notifications successfully', async () => {
        const mockCourseDetails = [
            {
                "staff_name": "John Doe",
                "startDate": '2024-11-01T10:00:00.000Z',
                "course_name": "First Aid",
                "location": "Changi South Avenue 1"
            }
        ];

        getCourseDetails.mockResolvedValue(mockCourseDetails);
        findOneByName.mockResolvedValue([{ subscription: "some-subscription-id" }]);
        sendNotification.mockResolvedValue();

        await scheduleNotification(mockReq, mockRes);

        expect(getCourseDetails).toHaveBeenCalled();
        expect(findOneByName).toHaveBeenCalledWith('John Doe');

        expect(sendNotification).toHaveBeenCalledWith('John Doe', 'some-subscription-id', 'First Aid', '2024-11-01T10:00:00.000Z', 'Changi South Avenue 1');
        expect(mockRes.send).toHaveBeenCalledWith("All notifications scheduled successfully");
    });

    test('should handle staff not subscribed to notifications', async () => {
        const mockCourseDetails = [
            {
                "staff_name": "Jane Doe",
                "startDate": '2024-11-01T10:00:00.000Z',
                "course_name": "CPR",
                "location": "Changi South Avenue 1"
            }
        ];

        getCourseDetails.mockResolvedValue(mockCourseDetails);
        findOneByName.mockResolvedValue([]);

        await scheduleNotification(mockReq, mockRes);

        expect(getCourseDetails).toHaveBeenCalled();
        expect(findOneByName).toHaveBeenCalledWith("Jane Doe");
        expect(sendNotification).not.toHaveBeenCalled();
        expect(mockRes.send).toHaveBeenCalledWith("All notifications scheduled successfully");
    });

    test('should handle errors in sending notifications', async () => {
        const mockCourseDetails = [
            {
                "staff_name": "John Doe",
                "startDate": '2024-11-01T10:00:00.000Z',
                "course_name": "First Aid",
                "location": "Changi South Avenue 1"
            }
        ];

        getCourseDetails.mockResolvedValue(mockCourseDetails);
        findOneByName.mockResolvedValue([{ subscription: "some-subscription-id" }]);
        sendNotification.mockRejectedValue(new Error('Network Error'));

        await scheduleNotification(mockReq, mockRes);

        expect(getCourseDetails).toHaveBeenCalled();
        expect(findOneByName).toHaveBeenCalledWith('John Doe');
        expect(sendNotification).toHaveBeenCalledWith('John Doe', 'some-subscription-id', 'First Aid', '2024-11-01T10:00:00.000Z', 'Changi South Avenue 1');
        expect(mockRes.status).toHaveBeenCalledWith(500);
        expect(mockRes.send).toHaveBeenCalledWith({
            message: 'Some notifications could not be scheduled',
            errors: [{ name: 'John Doe', error: 'Network Error' }]
        });
    });

    test('should handle errors in fetching course details', async () => {
        getCourseDetails.mockRejectedValue(new Error('Database error'));

        await scheduleNotification(mockReq, mockRes);

        expect(getCourseDetails).toHaveBeenCalled();
        expect(mockRes.status).toHaveBeenCalledWith(500);
        expect(mockRes.send).toHaveBeenCalledWith({
            message: 'Error fetching courses to be scheduled',
            error: 'Database error'
        });
    });
});
