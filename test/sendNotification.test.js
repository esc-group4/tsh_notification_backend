import axios from 'axios';
import MockAdapter from 'axios-mock-adapter';
import { sendNotification } from '../controllers/notificationController.js';


const API_KEY = "MmE3NDY2ZWQtYmMxZi00ZDczLWIxYTYtNDQ2YjVkZmE2OTEx";
const ONE_SIGNAL_APP_ID = "4b7035fa-afda-4657-ab5f-033b8408a9a1";

describe('sendNotification', () => {
  let mock;

  beforeAll(() => {
    mock = new MockAdapter(axios);
  });

  afterEach(() => {
    mock.reset();
  });

  afterAll(() => {
    mock.restore();
  });

  test('should send a notification with the correct payload', async () => {
    const name = 'John Doe';
    const id = 'some-player-id';
    const course = 'First Aid';
    const startdate = '2024-09-01T10:00:00Z';

    const strmessage = `This is a message from TSH reminding ${name} to go for your course named ${course} at the start date ${startdate.split('T')[0]} at ${startdate.split('T')[1].split(':')[0]}:${startdate.split('T')[1].split(':')[1]}`;
    const notificationPayload = {
      app_id: ONE_SIGNAL_APP_ID,
      contents: { en: strmessage },
      include_player_ids: [id]
    };

    mock.onPost('https://onesignal.com/api/v1/notifications').reply(200);

    const response = await sendNotification(name, id, course, startdate);
    console.log(response);

  //   expect(mock.history.post.length).toBe(1);
  //   expect(mock.history.post[0].data).toEqual(JSON.stringify(notificationPayload));
  //   expect(mock.history.post[0].headers).toEqual({
  //     'Content-Type': 'application/json; charset=utf-8',
  //     'Authorization': `Basic ${API_KEY}`
  //   });
  // });
    expect(mock.history.post.length).toBe(1);
    const request = mock.history.post[0];

    // Verify the request payload
    expect(JSON.parse(request.data)).toEqual(notificationPayload);

    const headerObject = {
      'Content-Type': 'application/json; charset=utf-8',
      'Authorization': `Basic ${API_KEY}`
    };

    // Validate the request headers
    expect(request.headers['Content-Type']).toBe(headerObject['Content-Type']);
    expect(request.headers['Authorization']).toBe(headerObject['Authorization']);
        

    // Verify the response status
    expect(response.status).toBe(200);
  });

  test('should handle errors when Axios post request fails', async () => {
    const name = 'John Doe';
    const id = 'some-player-id';
    const course = 'First Aid';
    const startdate = '2024-09-01T10:00:00Z';

    // Mock the Axios post request to return an error
    mock.onPost('https://onesignal.com/api/v1/notifications').reply(500);

    try {
      await sendNotification(name, id, course, startdate);
      // Fail the test if no error is thrown
      fail('Expected error not thrown');
    } catch (error) {
      // Check if the error is handled as expected
      expect(error.response.status).toBe(500);
      expect(error.message).toMatch(/Request failed with status code 500/);
    }
  });
});

