import { IStationRealTimeDataType } from '../SQL'
export interface IDutyUpdateQuery {
  LineID: string,
  StationID: string
}

export interface IGCDATAQuery {
  Day: string
}

export interface IGetTempAndPresSChartResponse extends Pick<IStationRealTimeDataType, "Time"|"Tevc"|"Tevc_02"|"Pevc"|"Pevc_02"> {}

export interface IGetSVFAndGVFChartResponse extends Pick<IStationRealTimeDataType, "Time"|"SVF"|"SVF_02"|"GVF"|"GVF_02"> {}