import {LambdaService} from "./LambdaService";
import {ActivityService} from "./ActivityService";
import Lambda = require("aws-sdk/clients/lambda");
import {TestResultsService} from "./TestResultsService";
import {
  getActionableStaffIdsByTime,
  getLastEventTimeByTesterStaffId,
  getMostRecentActivityByTesterStaffId,
  getMostRecentTestResultByTesterStaffId,
  getStaleOpenVisits, getTesterEmailsFromTestResults,
  getTesterStaffIds,
  removeFromMap
} from "../utils/helpers";
import {IActivity, ITestResult} from "../models";
import {TIMES} from "../utils/Enums";


export class CleanupService {
  private lambdaService: LambdaService;
  private activityService: ActivityService;
  private testResultsService: TestResultsService;
  constructor() {
    this.lambdaService = new LambdaService(new Lambda());
    this.activityService = new ActivityService(this.lambdaService);
    this.testResultsService = new TestResultsService(this.lambdaService);
  }
  /**
   *
   */
  public async cleanupVisits(): Promise<any> {
    // Get all activities from last period of interest
    const allActivities: IActivity[] = await this.activityService.getRecentActivities();
    // Get stale open visits
    const openVisits: IActivity[] = getStaleOpenVisits(allActivities);
    // Get list of staffIDs from open visits
    const openVisitStaffIds: string[] = getTesterStaffIds(openVisits);
    // Get last activity for each staffId
    const mostRecentActivities: Map<string, IActivity> = getMostRecentActivityByTesterStaffId(allActivities, openVisitStaffIds);

    // Get all Test Results By Staff Id for open visits
    const testResults: Map<string, ITestResult[]> = await this.testResultsService.getRecentTestResultsByTesterStaffId(openVisitStaffIds);
    // Get the most recent Test Result logged by the testers
    const mostRecentTestResults: Map<string, ITestResult> = getMostRecentTestResultByTesterStaffId(testResults, openVisitStaffIds);

    // Get the time of the most recent logged event, of either type taken by each tester
    const lastActionTimes: Map<string, Date> = getLastEventTimeByTesterStaffId(mostRecentActivities, mostRecentTestResults, openVisitStaffIds);

    const testersToCloseVisits: string[] = getActionableStaffIdsByTime(lastActionTimes,TIMES.TERMINATION_TIME);
    // Get lists of staff to action;
    const filteredLastActions: Map<string, Date> = removeFromMap(lastActionTimes, testersToCloseVisits);
    const testersToNotify: string[] = getActionableStaffIdsByTime(lastActionTimes, TIMES.NOTIFICATION_TIME);

    const emailsToNotify: string[] = getTesterEmailsFromTestResults(testResults, testersToNotify);


    // For Each
      // find last event
      // If over notification timeout
        // send email
      // If over kill timeout
        // close activity

    return Promise.resolve();
  }
}
