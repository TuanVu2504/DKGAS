import { stationConfig } from '../../../globalSettings'
import { IViewStation, WSDispatchAction } from '../../../Interface'

const { stations } = stationConfig


export type TStationsState = IViewStation[]

const defaultState : TStationsState = stations.map( s => ({ ...s, LineID:1, realTime: [], connectionStatus: [] }));

export const stationsState = (state = defaultState, action: WSDispatchAction): TStationsState => {
  switch(action.type){
    case "StaionRealTimeUpdate": {
      return state.map( station => {
        const newState = action.payload.find(_state => _state.StationID == station.StationID)
        if(!newState) return station
        return { ...station, ...newState }
      })
    }

    case "StationConnectionStatus": {
      return state
    }

    case "StationDutyChange": { 
      const { StationID, LineID } = action.payload
      return state.map( station => station.StationID == StationID ? ({ ...station, LineID }) : station)
    }

    case "StationsDownload": {
      return action.payload
    }

    case "StationRealTimeDownload": {
      const payload = action.payload
      return state.map(station => station.StationID == payload.StationID ? { ...station, payload } : station)
    }

    default: return state
  }
}