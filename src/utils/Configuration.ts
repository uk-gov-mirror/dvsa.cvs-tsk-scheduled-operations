// @ts-ignore
import * as yml from "node-yaml";
import { Handler } from "aws-lambda";
import {IFunctionEvent, IInvokeConfig} from "../models";
import {ERRORS} from "./Enums";

class Configuration {

  private static instance: Configuration;
  private readonly config: any;

  constructor(configPath: string) {
    if (!process.env.BRANCH) { throw new Error(ERRORS.NO_BRANCH); }
    this.config = yml.readSync(configPath);

    // Replace environment variable references
    let stringifiedConfig: string = JSON.stringify(this.config);
    const envRegex: RegExp = /\${(\w+\b):?(\w+\b)?}/g;
    const matches: RegExpMatchArray | null = stringifiedConfig.match(envRegex);

    if (matches) {
      matches.forEach((match) => {
        envRegex.lastIndex = 0;
        const captureGroups: RegExpExecArray = envRegex.exec(match) as RegExpExecArray;

        // Insert the environment variable if available. If not, insert placeholder. If no placeholder, leave it as is.
        stringifiedConfig = stringifiedConfig.replace(match, (process.env[captureGroups[1]] || captureGroups[2] || captureGroups[1]));
      });
    }

    this.config = JSON.parse(stringifiedConfig);
  }

  /**
   * Retrieves the singleton instance of Configuration
   * @returns Configuration
   */
  public static getInstance(): Configuration {
    if (!this.instance) {
      this.instance = new Configuration("../config/config.yml");
    }

    return Configuration.instance;
  }

  /**
   * Retrieves the entire config as an object
   * @returns any
   */
  public getConfig(): any {
    return this.config;
  }

  /**
   * Retrieves the lambda functions declared in the config
   * @returns IFunctionEvent[]
   */
  public getFunctions(): IFunctionEvent[] {
    if (!this.config.functions) {
      throw new Error("Functions were not defined in the config file.");
    }

    return this.config.functions.map((fn: Handler) => {
      const [name, params] = Object.entries(fn)[0];

      return {
        name,
        function: require(`../functions/${name}`)[name],
        eventName: params.eventName,
        event: params.event
      };
    });
  }

  /**
   * Retrieves the Lambda Invoke config
   * @returns IInvokeConfig
   */
  public getInvokeConfig(): IInvokeConfig {
    if (!this.config.invoke) {
      throw new Error("Lambda Invoke config not defined in the config file.");
    }

    // Not defining BRANCH will default to local
    const env: string = (!process.env.BRANCH || process.env.BRANCH === "local") ? "local" : "remote";

    return this.config.invoke[env];
  }

}

export { Configuration };
