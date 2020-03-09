import {CleanupService} from "../services/cleanupService";
import HTTPError from "../models/HTTPError";
import HTTPResponse from "../models/HTTPResponse";
import {ISubSeg} from "../models/ISubSeg";

/* workaround AWSXRay.captureAWS(...) call obscures types provided by the AWS sdk.
https://github.com/aws/aws-xray-sdk-node/issues/14
*/
/* tslint:disable */
let AWS:any;
if (process.env._X_AMZN_TRACE_ID) {
  /* tslint:disable */
  AWS = require("aws-xray-sdk");
} else {
  console.log("Serverless Offline detected; skipping AWS X-Ray setup");
}
/* tslint:enable */

export const cleanupVisit = async () => {
  let subseg: ISubSeg | null = null;
  if (process.env._X_AMZN_TRACE_ID) {
    const segment = AWS.getSegment();
    AWS.capturePromise();
    if (segment) {
      subseg = segment.addNewSubsegment("cleanupVisits");
    }}
  const cleanupService = new CleanupService();


  try {
    return cleanupService.cleanupVisits()
      .then(() => {
        return new HTTPResponse(201, "Cleanup Success");
      })
      .catch((error) => {
        console.log("Error cleaning up visits", error);
        if (subseg) { subseg.addError(error.body); }
        return new HTTPError(error.statusCode, error.body);
      });
  } finally {
    if (subseg) {
      subseg.close();
    }
  }
};
