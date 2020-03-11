import {ActivityService} from "../../src/services/ActivityService";
import {LambdaService} from "../../src/services/LambdaService";
import HTTPResponse from "../../src/models/HTTPResponse";
import HTTPError from "../../src/models/HTTPError";
import {wrapLambdaResponse} from "../util/responseUtils";
import activitiesResponse from "../resources/activities-response.json"

describe("Activity Service", () => {
  const realDate = Date;

  afterEach(() => {
    jest.restoreAllMocks();
    jest.resetModuleRegistry();
  });

  describe("Constructor", () => {
    it("should set the local lambdaClient", () => {
      const mockLambdaClient = new (jest.fn())();
      const svc = new ActivityService(mockLambdaClient);
      expect((svc as any).lambdaClient).toEqual(mockLambdaClient);
    });
  });

  describe("getRecentActivities",  () => {
    it("is invoking getActivities with correct param", async () => {
      // Param  should be TIMES.TERMINATION_TIME+1 before "now"
      setupDateMock('2019-05-14T11:01:58.135Z');
      const expectedTime = '2019-05-14T05:01:58.135Z';
      const getActivitiesMock = jest.fn();
      jest.spyOn(ActivityService.prototype,"getActivities").mockImplementation(getActivitiesMock);

      const svc = new ActivityService(null as unknown as LambdaService);
      await svc.getRecentActivities();
      expect(getActivitiesMock.mock.calls[0][0]).toEqual({fromStartTime: expectedTime});

      restoreDateMock();
    });
  });

  describe("getActivities", () => {
    beforeEach(() => {
      jest.restoreAllMocks();
      jest.resetModuleRegistry();
    });


    context("when no data is returned from database", () => {
      it("should throw error", () => {
        const invokeMock = jest.fn().mockResolvedValue(wrapLambdaResponse(JSON.stringify({
          body: "No resources match the search criteria",
          statusCode: 404
        })));
        const lambdaSvcMock = jest.fn().mockImplementation(() => {return {invoke: invokeMock}}) ;
        const svc = new ActivityService(new lambdaSvcMock());

        expect.assertions(2);

        return svc.getActivities({fromStartTime: "2020-02-12"})
          .catch((error: HTTPError) => {
            expect(error.statusCode).toEqual(404);
            expect(error.body).toEqual("No resources match the search criteria");
          });
      });
    });

    describe("Lambda client returns a single record in expected format", () => {
      it("returns parsed result", async () => {
        const mockLambdaService = jest.fn().mockImplementation(() => {
          return {
            invoke: () => Promise.resolve(wrapLambdaResponse(JSON.stringify(activitiesResponse))),
          };
        });
        const activityService = new ActivityService(new mockLambdaService());
        const result = await activityService.getActivities({fromStartTime: "2020-02-12"});
        expect(result).toEqual(JSON.parse(activitiesResponse.body));
      });
    });
  });



  const setupDateMock = (dateString: string) => {
    const currentDate = new Date(dateString);
    // @ts-ignore
    global.Date = class extends Date {
      constructor(...args: any) {
        if (args.length > 0) {
          // @ts-ignore
          return super(...args);
        }

        return currentDate;
      }
    };
  };
  const restoreDateMock = () => {
    global.Date = realDate;
  };

});
