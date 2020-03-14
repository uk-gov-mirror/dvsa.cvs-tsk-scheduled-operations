import {TestResultsService} from "../../src/services/TestResultsService";
import testResults from "../resources/testTestResults.json";
import {ITestResult} from "../../src/models";

describe("Test Results Service", () => {
  describe("getRecentTestResultsByTesterStaffId", () => {
    describe("when all testers have recent results", () => {
      const getTestResultsSpy = jest.spyOn(TestResultsService.prototype, "getTestResults").mockResolvedValue(testResults);
      const svc = new TestResultsService(new (jest.fn()));
      let output: Map<string, ITestResult[]>;
      svc.getRecentTestResultsByTesterStaffId(["abc", "123"]).then((data) => {
       output = data;
      });

      it("should call getTestResults once per staffId, with correct params", () => {
        expect(getTestResultsSpy.mock.calls).toHaveLength(2);
        expect(getTestResultsSpy.mock.calls[0][0].testerStaffId).toEqual("abc");
        expect(getTestResultsSpy.mock.calls[0][0].toDateTime.split(".")[0]).toEqual(new Date().toISOString().split(".")[0]);
      });
      it("should return a list of recent test results for each testerId", () => {
        expect(output.get("abc")).toEqual(testResults);
        expect(output.get("123")).toEqual(testResults);
      });
    });

  });
});
