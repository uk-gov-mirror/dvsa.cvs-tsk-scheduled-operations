import {Handler} from "aws-lambda";

interface IActivityParams {
  fromStartTime: string;
  toStartTime?: string;
  activityType?: string;
  testStationsPNumber?: string;
  testerStaffId?: string;
  endTimeNull?: boolean;
}

interface IActivity {
  id: string;
  activityType: string;
  testStationName: string;
  testStationPNumber: string;
  testStationEmail: string;
  testStationType: string;
  testerName: string;
  testerStaffId: string;
  startTime: string;
  endTime: string | null;
  waitReason?: [string];
  notes?: string;
}

interface IActivitiesList {
  startTime: string;
  activityType: string;
  activity: IActivity;
}

export interface ITestResult {
  testResultId: string;
  systemNumber: string;
  testerStaffId: string;
  testStartTimestamp: Date;
  odometerReadingUnits: string;
  testEndTimestamp: Date;
  testStatus: string;
  testTypes: any[];
  vehicleClass: VehicleClass;
  vin: string;
  vehicleSize?: string; // Mandatory for PSV only & not applicable to HGV and TRL
  testStationName: string;
  vehicleId?: string; // Not sent from FE, calculated in the BE. When the test result is submitted, in BE, the VRM of the vehicle will be copied into  vehicleId also.
  vehicleType: string;
  countryOfRegistration: string;
  preparerId: string;
  preparerName: string;
  odometerReading: number;
  vehicleConfiguration: string;
  testStationType: string;
  reasonForCancellation: string | null;
  testerName: string;
  vrm?: string; // Mandatory for PSV and HGV, not applicable to TRL
  testStationPNumber: string;
  numberOfSeats?: number; // mandatory for PSV only, not applicable for HGV and TRL
  noOfAxles: number;
  testerEmailAddress: string;
  euVehicleCategory: string;
  deletionFlag: boolean | null; // Not sent from FE, calculated in the BE.
  regnDate?: Date; // Used only for PSV and HGV
  trailerId?: string; // Mandatory for TRL, not applicable to PSV and HGV
  firstUseDate?: Date; // Used only for TRL
}

export interface VehicleClass {
  code: string;
  description: string;
}

interface IFunctionEvent {
  name: string;
  path: string;
  function: Handler;
  eventName?: string;
  event?: {
    details: {
      eventName: string;
    }
  };
}

interface IInvokeConfig {
  params: { apiVersion: string; endpoint?: string; };
  functions: { testResults: { name: string }, activities: { name: string } };
}

export { IActivityParams, IActivity, IInvokeConfig, IActivitiesList, IFunctionEvent };
