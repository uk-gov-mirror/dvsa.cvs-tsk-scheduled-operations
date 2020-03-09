import { PromiseResult } from "aws-sdk/lib/request";
import { AWSError, Lambda } from "aws-sdk";
import { LambdaService } from "./LambdaService";
import { Configuration } from "../utils/Configuration";
import dateFns from "date-fns";
import {TIMES} from "../utils/Enums";
import {uniq} from "lodash";
import {IActivity, IActivityParams, IInvokeConfig} from "../models";
import {validateInvocationResponse} from "../utils/validateInvocationResponse";

class ActivityService {
  private readonly lambdaClient: LambdaService;
  private readonly config: Configuration;
  private activities: IActivity[] | undefined;

  constructor(lambdaClient: LambdaService) {
    this.lambdaClient = lambdaClient;
    this.config = Configuration.getInstance();
  }

  public async getRecentActivities(): Promise<IActivity[]> {
    // Get unclosed Visit activities from the last period of interest
    const params = {
      fromStartTime: dateFns.subHours(new Date(), TIMES.TERMINATION_TIME + 1).toISOString(),
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
}

export { ActivityService };
