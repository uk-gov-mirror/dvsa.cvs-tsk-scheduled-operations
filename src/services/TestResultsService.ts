import {IInvokeConfig, ITestResult} from "../models";
import { PromiseResult } from "aws-sdk/lib/request";
import { AWSError, Lambda } from "aws-sdk";
import { LambdaService } from "./LambdaService";
import { Configuration } from "../utils/Configuration";
import {validateInvocationResponse} from "../utils/validateInvocationResponse";
import dateFns from "date-fns";
import {TIMES} from "../utils/Enums";

class TestResultsService {
  private readonly lambdaClient: LambdaService;
  private readonly config: Configuration;

  constructor(lambdaClient: LambdaService) {
    this.lambdaClient = lambdaClient;
    this.config = Configuration.getInstance();
  }

  public async getRecentTestResultsByTesterStaffId(testerStaffIds: string[]): Promise<any> {
    const results = new Map<string, ITestResult[]>();
    // Get results from the period of interest, plus one hour
    testerStaffIds.forEach(async (testerStaffId) => {
      const params = {
        testerStaffId,
        fromDateTime: dateFns.subHours(new Date(), TIMES.TERMINATION_TIME + 1)
      };
      const result = await this.getTestResults(params) as ITestResult[];
      results.set(testerStaffId, result);
    });
  }

  /**
   * Retrieves test results based on the provided parameters
   * @param params - getTestResultsByTesterStaffId query parameters
   */
  private getTestResults(params: any): Promise<any> {
    const config: IInvokeConfig = this.config.getInvokeConfig();
    const invokeParams: any = {
      FunctionName: config.functions.testResults.name,
      InvocationType: "RequestResponse",
      LogType: "Tail",
      Payload: JSON.stringify({
        httpMethod: "GET",
        path: "/test-results/getTestResultsByTesterStaffId",
        queryStringParameters: params
      }),
    };
    return this.lambdaClient.invoke(invokeParams)
      .then((response: PromiseResult<Lambda.Types.InvocationResponse, AWSError>) => {
        const payload: any = validateInvocationResponse(response); // Response validation
        return JSON.parse(payload.body); // Response conversion

      });
  }
}

export { TestResultsService };
