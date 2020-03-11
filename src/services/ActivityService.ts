import { PromiseResult } from "aws-sdk/lib/request";
import { AWSError, Lambda } from "aws-sdk";
import { LambdaService } from "./LambdaService";
import { Configuration } from "../utils/Configuration";
import {subHours} from "date-fns";
import {TIMES} from "../utils/Enums";
import {IActivity, IActivityParams, IInvokeConfig} from "../models";
import {validateInvocationResponse} from "../utils/validateInvocationResponse";

class ActivityService {
  private readonly lambdaClient: LambdaService;
  private readonly config: Configuration;

  constructor(lambdaClient: LambdaService) {
    this.lambdaClient = lambdaClient;
    this.config = Configuration.getInstance();
  }

  public async getRecentActivities(): Promise<IActivity[]> {
    // Get unclosed Visit activities from the last period of interest
    const params = {
      fromStartTime: subHours(new Date(), TIMES.TERMINATION_TIME + 1).toISOString(),
    };

    return await this.getActivities(params);
  }

  /**
   * Retrieves Activities based on the provided parameters
   * @param params - getActivities query parameters
   */
  public getActivities(params: IActivityParams): Promise<IActivity[]> {
    const config: IInvokeConfig = this.config.getInvokeConfig();
    const invokeParams: any = {
      FunctionName: config.functions.activities.name,
      InvocationType: "RequestResponse",
      LogType: "Tail",
      Payload: JSON.stringify({
        httpMethod: "GET",
        path: "/activities/details",
        queryStringParameters: params
      }),
    };
    return this.lambdaClient.invoke(invokeParams)
      .then((response: PromiseResult<Lambda.Types.InvocationResponse, AWSError>) => {
        const payload: any = validateInvocationResponse(response); // Response validation
        const activityResults: any[] = JSON.parse(payload.body); // Response conversion
        return activityResults;
      }) as Promise<IActivity[]>;
  }

  public endActivities(activities: IActivity[]) {
    activities.forEach((activity: IActivity) => {
      this.endActivity(activity.id);
    });
  }

  /**
   *  Closes Activities based on the provided id
   * @param id - the activity id
   */
  private endActivity(id: string): Promise<any> {
    const config: IInvokeConfig = this.config.getInvokeConfig();
    const invokeParams: any = {
      FunctionName: config.functions.activities.name,
      InvocationType: "RequestResponse",
      LogType: "Tail",
      Payload: JSON.stringify({
        httpMethod: "PUT",
        path: `/activities/${id}/end`,
        pathParameters:  {
          id
        }
      }),
    };
    console.log("Ending activity: ", id);
    return this.lambdaClient.invoke(invokeParams)
      .then((response: PromiseResult<Lambda.Types.InvocationResponse, AWSError>) => {
        const payload: any = validateInvocationResponse(response); // Response validation
        const activityResults: any[] = JSON.parse(payload.body); // Response conversion
        return activityResults;
      });
  }


}

export { ActivityService };
