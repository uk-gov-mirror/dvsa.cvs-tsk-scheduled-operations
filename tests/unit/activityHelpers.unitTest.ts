import {getActivityDateTime, getMostRecentActivityByTesterStaffId, removeFromMap} from "../../src/utils/helpers";
import testActivities from "../resources/testActivities.json";
import {cloneDeep} from "lodash";
import {IActivity} from "../../src/models";

describe("Activity Helper functions", ()=> {
  describe("getMostRecentActivityByTesterStaffId", () => {
    describe("when passed an array of activities and a staffId with activities in the array", () => {
      const activities: IActivity[] = cloneDeep(testActivities);
      const staffID = "abc123";
      const output: Map<string, IActivity> = getMostRecentActivityByTesterStaffId(activities, [staffID]);
      it("Should only use records matching the staffId", () => {
        expect((output.get(staffID) as IActivity).testerStaffId).toEqual(staffID);
      });
      it("Should the latest record for the staffId", () => {
        expect((output.get(staffID) as IActivity)).toEqual(activities[1]);
      });
      it("Should use startTime for sorting if endTime is missing", () => {
        const activities2: IActivity[] = cloneDeep(testActivities);
        activities2[1].endTime = null;
        const output2: Map<string, IActivity> = getMostRecentActivityByTesterStaffId(activities2, [staffID]);
        expect((output2.get(staffID) as IActivity)).toEqual(activities2[1]);
      });
    });
    describe("when passed an empty array", () => {
      it("should return a map of size matching the staffId array, but empty results", () => {
        const output = getMostRecentActivityByTesterStaffId([],["anything"]);
        expect(output).toBeInstanceOf(Map);
        expect(output.size).toEqual(1);
        expect(output.get("anything")).toEqual(undefined);
      });
    });
  });

  describe("getActivityDateTime", () => {
    const activities: IActivity[] = cloneDeep(testActivities);
    it("should extract endTime from an activity, if present", () => {
      expect(activities[0].endTime).not.toBeUndefined();
      expect(activities[0].endTime).not.toBeNull();
      expect(getActivityDateTime(activities[0])).toEqual(new Date(activities[0].endTime as string));
    });
    it("should extract the startTime from activity, if endTime is not present", () => {
      activities[1].endTime = null;
      expect(getActivityDateTime(activities[1])).toEqual(new Date(activities[1].startTime));
    });
  });

  describe("removeFromMap", () => {
    it("should remove KeyVal pairs specified with the specified keys and return all others", () => {
      const myMap = new Map([["key1", "val1"], ["key2", "val2"], ["key3", "val3"], ["key4", "val4"]]);
      expect(myMap.size).toEqual(4);
      const output = removeFromMap(myMap,["key1", "key4"]);
      expect(output.size).toEqual(2);
      expect(output.get("key1")).toBeUndefined();
      expect(output.get("key2")).toEqual("val2");
    });
  });
});
