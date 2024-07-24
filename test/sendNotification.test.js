import { expect } from 'chai';
import sinon from 'sinon';
import axios from 'axios';
import sendNotification from '../controllers/notificationController.js';

// for emailnotifier.kesug.com
// const API_KEY = "ODk5NDUzNjUtMzBkZS00ZTNiLWE3YWUtMWY5M2JhNWRiN2Iy";
// const ONE_SIGNAL_APP_ID = "39dc6c84-8625-4449-bfd2-db8c9b58e9f0";

// for local testing
const API_KEY = "MmE3NDY2ZWQtYmMxZi00ZDczLWIxYTYtNDQ2YjVkZmE2OTEx";
const ONE_SIGNAL_APP_ID = "4b7035fa-afda-4657-ab5f-033b8408a9a1";

describe('sendNotification', () => {
  let req, res, axiosPostStub;

  beforeEach(() => {
    // Setup mock request and response objects
    req = {
      params: {
        id: 'test-id',
        msg: 'Notification sent to user.'
      }
    };
    res = {
      json: sinon.stub(),
      status: sinon.stub().returnsThis()
    };

    // Stub the axios.post method
    axiosPostStub = sinon.stub(axios, 'post');
  });

  afterEach(() => {
    // Restore the original methods
    sinon.restore();
  });

  it('should send a notification successfully', async () => {
    // Arrange
    const mockResponse = { data: { id: 'notification-id' } };
    axiosPostStub.resolves(mockResponse);

    // Act
    await sendNotification(req, res);

    // Assert
    expect(axiosPostStub.calledOnce).to.be.true;
    expect(axiosPostStub.firstCall.args[0]).to.equal('https://onesignal.com/api/v1/notifications');
    expect(axiosPostStub.firstCall.args[1]).to.deep.equal({
      app_id: ONE_SIGNAL_APP_ID,
      contents: { en: 'Notification sent to user.' },
      include_player_ids: ['test-id']
    });
    expect(axiosPostStub.firstCall.args[2]).to.deep.equal({
      headers: {
        'Content-Type': 'application/json; charset=utf-8',
        'Authorization': `Basic ${API_KEY}`
      }
    });
    expect(res.json.calledOnce).to.be.true;
    expect(res.json.firstCall.args[0]).to.deep.equal({ reply: mockResponse.data });
  });

  it('should handle errors correctly', async () => {
    // Arrange
    const mockError = new Error('Something went wrong');
    axiosPostStub.rejects(mockError);

    // Act
    await sendNotification(req, res);

    // Assert
    expect(axiosPostStub.calledOnce).to.be.true;
    expect(res.status.calledOnceWith(500)).to.be.true;
    expect(res.json.calledOnce).to.be.true;
    expect(res.json.firstCall.args[0]).to.deep.equal({ message: 'Error fetching recent subscriptions', error: 'Something went wrong' });
  });
});