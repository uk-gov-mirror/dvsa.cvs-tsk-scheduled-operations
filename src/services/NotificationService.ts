// @ts-ignore
import { NotifyClient } from "notifications-node-client";
import {TEMPLATE_IDS} from "../utils/Enums";
import {ITesterDetails} from "../models";

/**
 * Service class for Certificate Notifications
 */
class NotificationService {
  private readonly notifyClient: NotifyClient;

  constructor(notifyClient: NotifyClient) {
    this.notifyClient = notifyClient;
  }

  /**
   * Send multiple emails based on array of user details
   * @param userDetails
   */
  public sendVisitExpiryNotifications(userDetails: ITesterDetails[]) {
    const emails: Promise<any>[] = [];
    userDetails.forEach(async ({email}) => {
      const params = {
        email,
        personalisation: {
        }
      };
      console.log("Sending visit expiry email to: ", email);
      emails.push(this.sendNotification(params));
    });
    return Promise.all(emails)
      .catch((error) => {
        console.log("Failed to send email: ", error);
      });
  }

  /**
   * Sending email according to the given params
   * @param params - personalization details and email
   */
  private sendNotification(params: any) {
    return this.notifyClient.sendEmail(TEMPLATE_IDS.TESTER_VISIT_EXPIRY, params.email, params.personalisation)
      .then((response: any) => {
        console.log("Response from Notify Client: ", response);
        return response;
      })
      .catch((err: any) => {
        console.error(err);
        throw err;
      });
  }
}

export { NotificationService };
