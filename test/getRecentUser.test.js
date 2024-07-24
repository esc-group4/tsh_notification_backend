import { expect } from 'chai';
import sinon from 'sinon';
import axios from 'axios';
import getRecentUser from '../controllers/userController.js';

// for emailnotifier.kesug.com
// const API_KEY = "ODk5NDUzNjUtMzBkZS00ZTNiLWE3YWUtMWY5M2JhNWRiN2Iy";
// const ONE_SIGNAL_APP_ID = "39dc6c84-8625-4449-bfd2-db8c9b58e9f0";

// for local testing
const API_KEY = "MmE3NDY2ZWQtYmMxZi00ZDczLWIxYTYtNDQ2YjVkZmE2OTEx";
const ONE_SIGNAL_APP_ID = "4b7035fa-afda-4657-ab5f-033b8408a9a1";

describe('getRecentUser', () => {
    let req, res, axiosGetStub;
  
    beforeEach(() => {
      // Setup mock request and response objects
      req = {};
      res = {
        json: sinon.stub(),
        status: sinon.stub().returnsThis()
      };
  
      // Stub the axios.get method
      axiosGetStub = sinon.stub(axios, 'get');
    });
  
    afterEach(() => {
      // Restore the original methods
      sinon.restore();
    });
  
    it('should return the recent user id successfully', async () => {
      // Arrange
      const mockResponse = { data: { players: [{ id: 'old-id' }, { id: 'recent-id' }] } };
      axiosGetStub.resolves(mockResponse);
  
      // Act
      await getRecentUser(req, res);
  
      // Assert
      expect(axiosGetStub.calledOnce).to.be.true;
      expect(axiosGetStub.firstCall.args[0]).to.equal(`https://onesignal.com/api/v1/players?app_id=${ONE_SIGNAL_APP_ID}`);
      expect(axiosGetStub.firstCall.args[1]).to.deep.equal({
        headers: {
          'Authorization': `Basic ${API_KEY}`,
          'Content-Type': 'application/json; charset=utf-8'
        }
      });
      expect(res.json.calledOnce).to.be.true;
      expect(res.json.firstCall.args[0]).to.deep.equal({ recent: 'recent-id' });
    });
  
    it('should handle errors correctly', async () => {
      // Arrange
      const mockError = new Error('Something went wrong');
      axiosGetStub.rejects(mockError);
  
      // Act
      await getRecentUser(req, res);
  
      // Assert
      expect(axiosGetStub.calledOnce).to.be.true;
      expect(res.status.calledOnceWith(500)).to.be.true;
      expect(res.json.calledOnce).to.be.true;
      expect(res.json.firstCall.args[0]).to.deep.equal({ message: 'Error fetching recent subscriptions', error: 'Something went wrong' });
    });
  });