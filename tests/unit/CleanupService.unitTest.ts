import {CleanupService} from "../../src/services/CleanupService";
import {ActivityService} from "../../src/services/ActivityService";
import activities from "../resources/testActivities.json";
import testResults from "../resources/testTestResults.json";
import {TestResultsService} from "../../src/services/TestResultsService";
import {cloneDeep} from "lodash";
import {IActivity} from "../../src/models";
import dateMock from "../util/dateMockUtils";
jest.mock("../../src/services/ActivityService");

describe("Cleanup Service", () => {
  afterEach(() => {
    jest.resetModuleRegistry();
    dateMock.restoreDateMock();
  });
  describe("With a visit deserving of Notification", () => {
    it("correctly sends a notification, but not close the activity", async () => {
      expect.assertions(3);
      dateMock.setupDateMock("2020-03-05T17:29:45.938Z");
      const sendNotifyMock = jest.fn();
      const notifySvcMock = jest.fn().mockImplementation(() => {
        return {
          sendVisitExpiryNotifications: sendNotifyMock
        }
      });
      const allActivities: IActivity[] = cloneDeep(activities);
      const staleActivities = allActivities.map((a) => {
        a.endTime = null;
        return a;
      });

      ActivityService.prototype.getRecentActivities =  jest.fn().mockResolvedValue(staleActivities);
      const endActivitiesMock = jest.fn();
      ActivityService.prototype.endActivities = endActivitiesMock;
      TestResultsService.prototype.getTestResults = jest.fn().mockImplementation((params) => {
        return testResults.filter(t => t.testerStaffId === params.testerStaffId);
      });
      const svc = new CleanupService(new notifySvcMock());
      await svc.cleanupVisits();
      expect(sendNotifyMock.mock.calls[0][0]).toHaveLength(1);
      expect(sendNotifyMock.mock.calls[0][0][0].email).toEqual(activities[0].testerEmail);
      expect(endActivitiesMock.mock.calls[0][0]).toHaveLength(0);
    });
  });
});
