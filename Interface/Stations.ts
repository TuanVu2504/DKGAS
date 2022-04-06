import { 
  IStationRealTimeDataType, IStationConnectionHistory, 
  IDBSwitchGCdata, IDBStationDailyReport,
  IDBVolumeStationManual, IDBUpstreamMonthlyManualReport, IDBGCDATA, 
  IDBGCDATAEventParse, IDB51Hourly } from './SQL'
import { IWSGCDataSwitchLive } from './Websocket'

export interface IDBStation {
  stationCode: string,
  StationID: number,
  lines: string[],
  type: 'FC'|'EVC'
  name: string,
  routerIP: string,
  plcIP: string
}

export type IStationConfigWithRealTime = IDBStation & { 
  realTime: IStationRealTimeDataType[], 
  connectionStatus: IStationConnectionHistory[] 
}

export type IViewStation = IStationConfigWithRealTime & IPromptSetDuty

export interface IStationDutyChange {
  type: "StationDutyChange",
  payload: IPromptSetDuty,
}

export interface IPromptSetDuty extends IDBStation {
  LineID: number
}

export interface IReportState {
  dailyReport: IDBStationDailyReport[],
  dailyManualReport: IDBVolumeStationManual[],
  upstreamMonthlyReport: IDBUpstreamMonthlyManualReport|undefined, 
  db51Daily: IDB51Hourly[]
}

export interface IGCDataState {
  gcData: IDBGCDATA[],
  gcDataEvent: IDBGCDATAEventParse[],
  gcDataLive: IDBGCDATA
  gcDataLiveMode: IDBSwitchGCdata
}

export interface IGCDataDownload { 
  type: "GCDataDownload", payload: IGCDataState
}

export interface IGCDataUpdated {
  type: "GCDataUpdated", payload: IDBGCDATA
}

export interface IGCDataEventAdd {
  type : "GCDataEventAdd", payload: IDBGCDATAEventParse
}

export interface IGCDataLiveUpdate {
  type: "GCDataLiveUpdate", payload: IDBGCDATA
}

export type IGCDataUpdate = { newGCData: IDBGCDATA, newGCDataEvent: IDBGCDATAEventParse, gcDataLive: IDBGCDATA  }

export type GCDataActions = IGCDataEventAdd | IGCDataUpdated | IGCDataDownload | IGCDataLiveUpdate | IWSGCDataSwitchLive
