import { SQLServer } from '../toolts'
import { stationConfig, stationRealTimeInterval } from '../../../globalSettings'
import { IWSDataRealTimeUpdate, IStationConfigWithRealTime } from '../../../Interface'
import { WebSocketStore } from './SocketStore'

// const webskStore = WebSocketStore.getSockets()

// async function watchStationRealTime(){
//   const RealTimeUpdatePayload: IStationConfigWithRealTime[] = await Promise.all(stationConfig.stations.map(async station => {
//     const dbRealTime_get        = SQLServer.getStationRealTimeLatest(station.StationID)
//     const connectionStatus_get  = SQLServer.getConnectionStatus(station.StationID)
    
//     const [realTime, connectionStatus] = await Promise.all([dbRealTime_get, connectionStatus_get])
//     return {
//       ...station,
//       realTime: realTime.recordset,
//       connectionStatus
//     }
//   }))

//   const newStationRealTimeUpdate: IWSDataRealTimeUpdate = { 
//     type: "StaionRealTimeUpdate",
//     payload: RealTimeUpdatePayload,
//   }
//   webskStore.broadcast(newStationRealTimeUpdate)
//   await new Promise(res => setTimeout(res, stationRealTimeInterval))
//   watchStationRealTime()
// }

// watchStationRealTime()