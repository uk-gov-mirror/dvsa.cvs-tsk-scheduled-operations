import { Configuration } from "../../src/utils/Configuration";
import { IInvokeConfig } from "../../src/models";
import mockConfig from "../util/mockConfig";

describe("ConfigurationUtil", () => {
  mockConfig();
  const config: Configuration = Configuration.getInstance();
  const branch = process.env.BRANCH;

  context("when calling getConfig() and config file is present", () => {
    it("should return config instance", () => {
      const configInstance: any = config.getConfig();
      expect(configInstance).not.toEqual(undefined);
    });
  });

  context("when calling getInvokeConfig() and the BRANCH environment variable is not defined", () => {
    it("should return local invokeConfig", () => {
      process.env.BRANCH = "";
      const invokeConfigInstance: IInvokeConfig = config.getInvokeConfig();
      expect(invokeConfigInstance.params.endpoint).not.toEqual(undefined);
      expect(invokeConfigInstance.params.endpoint).toEqual("http://localhost:3013");
    });
  });
  context("when calling getInvokeConfig() and the BRANCH environment variable is local", () => {
    it("should return local invokeConfig", () => {
      process.env.BRANCH = "local";
      const invokeConfigInstance: IInvokeConfig = config.getInvokeConfig();
      expect(invokeConfigInstance.params.endpoint).not.toEqual(undefined);
      expect(invokeConfigInstance.params.endpoint).toEqual("http://localhost:3013");
    });
  });
  process.env.BRANCH = branch;
});
