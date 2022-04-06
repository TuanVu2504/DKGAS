import { stationConfig } from '../../../globalSettings'
import { SQLServer } from '../toolts'

export function initializeStationDuty(){
  return Promise.all(stationConfig.stations.map( async _station => 
    SQLServer.Table("Duty").select({ filter: { StationID: _station.StationID }})
    .then( res => res.recordset )
    .then(status => {
      if(status.length == 0){
        return SQLServer.Table("Duty").post([{
          StationID: _station.StationID, LineID: 1, SwitchAt: new Date().getTime(), SwitchBy:"admin"
        }])
        .then(() => console.log(`Added default LineID to 1 for station ${_station.name.toUpperCase()}`))
      }
    })
  ))
}