import { IDBSwitchGCdata, IViewStation } from '.'
import { IStationConfigWithRealTime, IDBStation, IStationDutyChange } from './Stations'

export interface IWSDataRealTimeUpdate {
  type: "StaionRealTimeUpdate"
  payload: IStationConfigWithRealTime[]
}

export interface IWSStaionConnectionStatus { 
  type: "StationConnectionStatus"
  payload: IDBStation & { connection: number }
}

export interface IFirstStationDownload {
  type: "StationsDownload"
  payload: IViewStation[]
}

export interface IStationRealTimeDownload {
  type: "StationRealTimeDownload",
  payload: IStationConfigWithRealTime
}

export interface IWSGCDataSwitchLive {
  type: "GCDataSwitchLive"
  payload: IDBSwitchGCdata
}


export type WSDispatchAction =  IWSDataRealTimeUpdate | IWSStaionConnectionStatus 
                                | IStationDutyChange  | IFirstStationDownload 
                                | IWSGCDataSwitchLive | IStationRealTimeDownload


                                
export interface IClientMessageInitializeConnection {
  type: "Initialize WebSocket Connection",
  payload: {
    id: string
  }
}

export type ClientMessageObject = IClientMessageInitializeConnection

export interface IServerMessageInitializeResponse {
  type: "Initialize WebSocket Connection",
  payload: {
    accept: boolean
  }
}
export type ServerMessageObject = IServerMessageInitializeResponse