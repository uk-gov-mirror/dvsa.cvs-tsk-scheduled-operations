import {IActivity, ITestResult} from "../models";
import {uniq, max, maxBy} from "lodash";
import dateFns from "date-fns";
import {TIMES} from "./Enums";

export const getStaleOpenVisits = (openVisits: IActivity[]): IActivity[] => {
  const warningTime = dateFns.subHours(new Date(), TIMES.NOTIFICATION_TIME);
  return openVisits
    .filter((a) => a.activityType === "visit")
    .filter((a) => a.endTime === null)
    .filter((a) => dateFns.isBefore(new Date(a.startTime), warningTime));
};

export const getTesterStaffIds = (activities: IActivity[]): string[] => {
  return uniq(activities.map((a) => a.testerStaffId));
};

export const getMostRecentActivityByTesterStaffId = (activities: IActivity[], staffIds: string[]): Map<string, IActivity> => {
  const mostRecentActivities = new Map<string, IActivity>();
  staffIds.forEach((id) => {
    const mostRecentActivity = maxBy(activities.filter((a) => a.testerStaffId === id), getActivityDateTime) as IActivity;
    mostRecentActivities.set(id, mostRecentActivity);
  });
  return mostRecentActivities;
};

export const getMostRecentTestResultByTesterStaffId = (testResults: Map<string,ITestResult[]>, staffIds: string[]): Map<string, ITestResult> => {
  const mostRecentTestResults = new Map<string, ITestResult>();
  staffIds.forEach((id) => {
    const mostRecentTestResult = maxBy(testResults.get(id), getTestResultDateTime) as ITestResult;
    mostRecentTestResults.set(id, mostRecentTestResult);
  });
  return mostRecentTestResults;
};

export const getActivityDateTime = (activity: IActivity): Date => {
  // Use an end time if available, otherwise use the start time
  return new Date (activity.endTime || activity.startTime);
};

export const getTestResultDateTime = (testResult: ITestResult): Date => {
  return new Date (testResult.testEndTimestamp );
};

export const getLastEventTimeByTesterStaffId = (activities: Map<string, IActivity>, testResults: Map<string, ITestResult>, staffIds: string[]): Map<string, Date> => {
  const events = new Map<string, Date>();
  staffIds.forEach((id) => {
    const activityDate = getActivityDateTime(activities.get(id) as IActivity);
    const testResultDate = getTestResultDateTime(testResults.get(id) as ITestResult);
    const maxDate = dateFns.isAfter(activityDate, testResultDate) ? activityDate : testResultDate;
    events.set(id, maxDate);
  });
  return events;
};

export const getActionableStaffIdsByTime = (lastActionsByStaffId: Map<string, Date>, NotificationTime: number): string[] => {
  const notificationThresholdTime = dateFns.subHours(new Date(), NotificationTime);
  const notifiableStaffIDs: string[] = [];
  lastActionsByStaffId.forEach((lastActionTime, staffID) => {
    if (dateFns.isBefore(lastActionTime, notificationThresholdTime)) {
      notifiableStaffIDs.push(staffID);
    }
  });
  return notifiableStaffIDs;
};

export const removeFromMap = (map: Map<string, any>, removeIds: string[]): Map<string, any> => {
  const newMap: Map<string, any> = new Map<string, any>();
  map.forEach((val, key) => {
    if (!removeIds.includes(key)) {
      newMap.set(key, val);
    }
  });
  return newMap;
};

export const getTesterEmailsFromTestResults = (testResults: Map<string,ITestResult[]>, staffIds: string[]): string[] => {
  const emails: string[] = [];
  staffIds.forEach((id) => {
    const email = testResults.get(id)?.[0].testerEmailAddress;
    if (email) {emails.push(email);}
  });
  return emails;
};
