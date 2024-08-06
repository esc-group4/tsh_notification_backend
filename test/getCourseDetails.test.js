import { getCourseDetails } from '../controllers/getCourse.js'; // Adjust the path if necessary

// Mock the fetch function
global.fetch = jest.fn();

describe('getCourseDetails', () => {
    beforeEach(() => {
        jest.resetAllMocks(); // Reset mocks before each test
    });

    it('should return course details on successful fetch', async () => {
        // Mock data
        const mockData = [
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

        // Mock fetch response
        fetch.mockResolvedValue({
            ok: true,
            json: async () => mockData
        });

        // Call the function
        const result = await getCourseDetails();

        // Assert
        expect(fetch).toHaveBeenCalledWith('http://localhost:8080/notification');
        expect(result).toEqual(mockData);
    });

    it('should return null on fetch failure', async () => {
        // Mock fetch to simulate an error
        fetch.mockResolvedValue({
            ok: false
        });

        // Call the function
        const result = await getCourseDetails();

        // Assert
        expect(fetch).toHaveBeenCalledWith('http://localhost:8080/notification');
        expect(result).toBeNull();
    });

    it('should handle network errors', async () => {
        // Mock fetch to throw an error
        fetch.mockRejectedValue(new Error('Network error'));

        // Call the function
        const result = await getCourseDetails();

        // Assert
        expect(fetch).toHaveBeenCalledWith('http://localhost:8080/notification');
        expect(result).toBeNull();
    });
});



// import sinon from 'sinon';
// // import fetch from 'node-fetch'; // Node fetch to be used in the test environment
// import { expect } from 'chai';

// // Testing function getCourseDetails()
// import getCourseDetails from '../controllers/getCourse.js';

// // Set up Mocha
// describe('getCourseDetails', function() {
//   let fetchStub;

//   beforeEach(function() {
//     // Create a stub for fetch
//     fetchStub = sinon.stub(global, 'fetch');
//   });

//   afterEach(function() {
//     // Restore the original fetch function
//     fetchStub.restore();
//   });

//   it('should return course details when the response is successful', async function() {
//     // Mock successful fetch response
//     const mockResponse = { course: 'Math', time: '10:00 AM' };
//     fetchStub.returns(Promise.resolve({
//       ok: true,
//       json: () => Promise.resolve(mockResponse)
//     }));

//     // Call the function and assert the results
//     const result = await getCourseDetails();
//     expect(result).to.deep.equal(mockResponse);
//   });

//   it('should handle errors if fetch fails', async function() {
//     // Mock failed fetch response
//     fetchStub.returns(Promise.resolve({
//       ok: false
//     }));

//     // Call the function and assert the results
//     const result = await getCourseDetails();
//     expect(result).to.be.null;
//   });

//   it('should handle exceptions during fetch', async function() {
//     // Mock fetch throwing an exception
//     fetchStub.returns(Promise.reject(new Error('Fetch error')));

//     // Call the function and assert the results
//     const result = await getCourseDetails();
//     expect(result).to.be.null;
//   });
// });
